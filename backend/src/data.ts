import fs from "fs";
import Trip from "./Trip/Trip.js";
import User from "./Auth/User.js";
import Info from "./Info.js";
import AsyncLock from "async-lock";
import TripSegment from "./Trip/TripSegment.js";
import Person from "./Hotel/Person.js";
import { AccessError } from "./Error/error.js";
import Hotel from "./Hotel/Hotel.js";
import Day from "./Activities/Day.js";
import Room from "./Hotel/Room.js";

export interface UserMap {
  [key: string]: User;
}
export interface TripMap {
  [key: string]: Trip;
}
let users: UserMap = {};
let trips: TripMap = {};
const DATABASE_PATH = "./database.json";

const lock = new AsyncLock();

export const update = async (users: UserMap, trips: TripMap) => {
  await lock.acquire("saveData", async () => {
    await fs.writeFile(
      DATABASE_PATH,
      JSON.stringify({
        users,
        trips,
      }),
      (err) => {
        if (err) throw new Error("Failed to write to database");
      }
    );
  });
};

export const getUsers = (): UserMap => users;
export const getTrips = (): TripMap => trips;

export const save = () => update(users, trips);

export const generateUserId = (): string => {
  let genId = "user" + Info.generateId();
  while (users[genId]) genId = "user" + Info.generateId();
  return genId;
};

export const generateTripId = (): string => {
  let genId = "trip" + Info.generateId();
  while (users[genId]) genId = "trip" + Info.generateId();
  return genId;
};

export const reset = async () => {
  users = {};
  trips = {};
  await update({}, {});
};

try {
  const data = JSON.parse(fs.readFileSync(DATABASE_PATH).toString());
  users = data.users;
  trips = data.trips;
} catch {
  console.log("WARNING: No database found, create a new one");
  save();
}

export const resourceLock = (callback: CallableFunction) =>
  new Promise((resolve, reject) => {
    lock.acquire("resourceLock", callback(resolve, reject));
  });

export const handleCreateNewTrip = async (
  info: string,
  start: Date,
  end: Date,
  metadata?: object
): Promise<string> => {
  return await lock.acquire("resourceLock", async () => {
    const newTrip = new Trip(
      generateTripId(),
      info,
      start,
      end,
      [],
      [],
      metadata
    );
    trips[newTrip.id] = newTrip;
    await save();
    return newTrip.id;
  });
};

export const handleGetTrip = (tripId: string): Trip => {
  if (!trips[tripId]) throw new AccessError("Trip does not exist");
  return trips[tripId];
};

export const handleUpdateTrip = async (
  tripId: string,
  info?: string,
  start?: Date,
  end?: Date,
  travellers?: Array<Person>,
  splits?: Array<TripSegment>,
  metadata?: object
) => {
  await lock.acquire("resourseLock", async () => {
    const target = trips[tripId];
    if (!target) throw new AccessError("Trip does not exist");
    target.updateInfo(info, metadata);
    if (travellers)
      travellers.forEach((t: Person) => {
        if (target.containsTraveller(t.id)) target.removeTraveller(t.id);
        target.addTraveller(t);
      });
    if (splits)
      splits.forEach((s: TripSegment) => {
        if (target.containsSplit(s.id)) target.removeSplit(s.id);
        target.addSplit(s);
      });
    target.updateDates(start, end);
    trips[tripId] = target;
  });
};

/**
|/splits/{tripId}                               |Lists all splits in a trip|GET    |
|/splits/new/{tripId}                           |Creates a new split in a  |POST   |
|/splits/get/{tripId}/{splitId}                 |Gets specific split in a  |GET    |
|/splits/update/{tripId}/{splitId}              |Updates a specific split  |PUT    |
|/splits/remove/{tripId}/{splitId}              |Removes a specific split  |DELETE |
*/

export const handleDeleteTrip = async (tripId: string) => {
  await lock.acquire("resourseLock", async () => {
    if (!trips[tripId]) throw new AccessError("Trip does not exist");
    trips = Object.keys(trips)
      .filter((objKey) => objKey !== tripId)
      .reduce((newObj: TripMap, key: string) => {
        newObj[key] = trips[key];
        return newObj;
      }, {});
  });
};

export const handleCreateNewSplit = async (
  tripId: string,
  info: string,
  start: Date,
  end: Date
): Promise<string> => {
  return await lock.acquire("resourseLock", async () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");

    const newSplit = new TripSegment(
      targetTrip.generateSplitId(),
      info,
      start,
      end,
      targetTrip.travellers
    );
    targetTrip.addSplit(newSplit);
    trips[tripId] = targetTrip;
    return newSplit.id;
  });
};

export const handleGetSplits = (tripId: string): Array<TripSegment> => {
  const targetTrip = trips[tripId];
  if (!targetTrip) throw new AccessError("Trip does not exist");
  return targetTrip.splits;
};

export const handleGetSplit = (
  tripId: string,
  splitId: string
): TripSegment => {
  const targetTrip = trips[tripId];
  if (!targetTrip) throw new AccessError("Trip does not exist");
  if (!targetTrip.containsSplit(splitId))
    throw new AccessError("Split does not exist");
  return targetTrip.getSplit(splitId)!;
};

export const handleUpdateSplit = async (
  tripId: string,
  splitId: string,
  info: string,
  start: Date,
  end: Date,
  metadata?: object,
  hotels?: Array<Hotel>,
  days?: Array<Day>
) => {
  await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    const travellers = targetTrip.travellers;
    if (!targetTrip) throw new AccessError("Trip does not exist");
    const targetSplit = targetTrip.getSplit(splitId);
    if (!targetSplit) throw new AccessError("Trip does not exist");

    targetSplit.updateInfo(info, metadata);
    targetSplit.updateDates(start, end);
    if (travellers)
      travellers.forEach((t: Person) => {
        if (targetSplit.containsTraveller(t.id))
          targetSplit.removeTraveller(t.id);
        targetSplit.addTraveller(t);
      });

    if (hotels)
      hotels.forEach((h: Hotel) => {
        if (targetSplit.containsHotel(h.id)) targetSplit.removeHotel(h.id);
        targetSplit.addHotel(h);
      });
    if (days)
      days.forEach((d: Day) => {
        if (targetSplit.containsDay(d.id)) targetSplit.removeDay(d.id);
        targetSplit.addDay(d);
      });
  });
};

export const handleDeleteSplit = async (tripId: string, splidId: string) => {
  await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    targetTrip.removeSplit(splidId);
  });
};

export const handleGetHotels = async (tripId: string, splitId: string) => {
  return await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    const targetSplit = targetTrip.getSplit(splitId);
    if (!targetSplit) throw new AccessError("Split does not exist");
    return targetSplit.hotels;
  });
};

export const handleGetHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string
): Promise<Hotel> =>
  await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    const targetSplit = targetTrip.getSplit(splitId);
    if (!targetSplit) throw new AccessError("Split does not exist");
    const targetHotel = targetSplit.getHotel(hotelId);
    if (!targetHotel) throw new AccessError("Hotel does not exist");
    return targetHotel;
  });

export const handleCreateNewHotel = async (
  tripId: string,
  splitId: string,
  info: string,
  checkIn: Date,
  checkOut: Date,
  location: string,
): Promise<string> => {
  return await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    const targetSplit = targetTrip.getSplit(splitId);
    if (!targetSplit) throw new AccessError("Split does not exist");
    const newHotel = new Hotel(targetSplit.generateHotelId(), info, checkIn, checkOut,location);
    targetSplit.addHotel(newHotel);
    return newHotel.id;
  })
}
export const handleUpdateHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  info?: string,
  checkIn?: Date,
  checkOut?: Date,
  location?: string,
  rooms?: Array<Room>,
  metadata?: object
) => {
  return await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    const targetSplit = targetTrip.getSplit(splitId);
    if (!targetSplit) throw new AccessError("Split does not exist");
    const targetHotel = targetSplit.getHotel(hotelId);
    if (!targetHotel) throw new AccessError("Hotel does not exist");
    targetHotel.updateInfo(info, metadata);
    targetHotel.updateDates(checkIn, checkOut);

    targetHotel.location = location ? location : targetHotel.location;

    if (rooms)
      rooms.forEach((r: Room) => {
        if (targetHotel.containsRoom(r.id)) targetHotel.removeRoom(r.id);
        targetHotel.addRoom(r);
      });

    return targetHotel;
  });
};

export const handleDeleteHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string
) => {
  await lock.acquire("resourseLock", () => {
    const targetTrip = trips[tripId];
    if (!targetTrip) throw new AccessError("Trip does not exist");
    targetTrip.removeHotel(splitId, hotelId);
  });
};
