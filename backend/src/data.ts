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
): Promise<string> => {
  return await lock.acquire("resourceLock", async () => {
    const newTrip = new Trip(
      generateTripId(),
      info,
      start,
      end,
    );
    trips[newTrip.id] = newTrip;
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
  metadata?: object
): Promise<boolean> =>
  await lock.acquire("resourseLock", async () => {
    const target = getTrip(tripId);
    target.updateInfo(info, metadata);
    target.updateDates(start, end);
    trips[tripId] = target;
    return target.wellformed();
  });

export const handleDeleteTrip = async (tripId: string) => {
  await lock.acquire("resourseLock", async () => {
    getTrip(tripId);
    trips = Object.keys(trips)
      .filter((objKey) => objKey !== tripId)
      .reduce((newObj: TripMap, key: string) => {
        newObj[key] = trips[key];
        return newObj;
      }, {});
  });
};

/**
|/splits/{tripId}                               |Lists all splits in a trip|GET    |
|/splits/new/{tripId}                           |Creates a new split in a  |POST   |
|/splits/get/{tripId}/{splitId}                 |Gets specific split in a  |GET    |
|/splits/update/{tripId}/{splitId}              |Updates a specific split  |PUT    |
|/splits/remove/{tripId}/{splitId}              |Removes a specific split  |DELETE |
*/

export const handleCreateNewSplit = async (
  tripId: string,
  info: string,
  start: Date,
  end: Date
): Promise<string> => {
  return await lock.acquire("resourseLock", async () => {
    const targetTrip = getTrip(tripId);

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
  const targetTrip = getTrip(tripId);
  return targetTrip.splits;
};

export const handleGetSplit = (
  tripId: string,
  splitId: string
): TripSegment => {
  return getSplit(tripId, splitId);
};

export const handleUpdateSplit = async (
  tripId: string,
  splitId: string,
  info: string,
  start: Date,
  end: Date,
  metadata?: object,
): Promise<boolean> =>
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

    return targetSplit.wellformed();
  });

export const handleDeleteSplit = async (tripId: string, splidId: string) => {
  await lock.acquire("resourseLock", () => {
    const targetTrip = getTrip(tripId);
    targetTrip.removeSplit(splidId);
  });
};

export const handleGetHotels = async (tripId: string, splitId: string) => {
  return await lock.acquire("resourseLock", () => {
    const targetSplit = getSplit(tripId,splitId);
    return targetSplit.hotels;
  });
};

export const handleGetHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string
): Promise<Hotel> =>
  await lock.acquire("resourseLock", () => {
    const hotel = getHotel(tripId, splitId, hotelId);
    return hotel;
  });

export const handleCreateNewHotel = async (
  tripId: string,
  splitId: string,
  info: string,
  checkIn: Date,
  checkOut: Date,
  location: string
): Promise<string> => {
  return await lock.acquire("resourseLock", () => {
    const targetSplit = getSplit(tripId, splitId);
    const newHotel = new Hotel(
      targetSplit.generateHotelId(),
      info,
      checkIn,
      checkOut,
      location
    );
    targetSplit.addHotel(newHotel);
    return newHotel.id;
  });
};
export const handleUpdateHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  info?: string,
  checkIn?: Date,
  checkOut?: Date,
  location?: string,
  metadata?: object
): Promise<boolean> => {
  return await lock.acquire("resourseLock", () => {
    const targetHotel = getHotel(tripId,splitId,hotelId);
    targetHotel.updateInfo(info, metadata);
    targetHotel.updateDates(checkIn, checkOut);

    targetHotel.location = location ? location : targetHotel.location;

    return targetHotel.wellformed();
  });
};

export const handleDeleteHotel = async (
  tripId: string,
  splitId: string,
  hotelId: string
) => {
  await lock.acquire("resourseLock", () => {
    const targetTrip = getTrip(tripId);
    targetTrip.removeHotel(splitId, hotelId);
  });
};

export const handleCreateNewRoom = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  info: string,
  price: number,
  capacity: number
): Promise<string> =>
  await lock.acquire("resourseLock", () => {
    const hotel = getHotel(tripId,splitId,hotelId);
    const newRoom = new Room(
      hotel.generateRoomId(),
      info,
      hotel.checkIn,
      hotel.checkOut,
      price,
      capacity
    );
    hotel.addRoom(newRoom);
    return newRoom.id;
  });

export const handleGetRooms = async (
  tripId: string,
  splitId: string,
  hotelId: string
): Promise<Array<Room>> => {
  return await lock.acquire("resourseLock", () => {
    const hotel = getHotel(tripId,splitId,hotelId);
    return hotel.rooms;
  });
};

export const handleGetRoom = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  roomId: string
): Promise<Room> => {
  return await lock.acquire("resourseLock", () => getRoom(tripId, splitId, hotelId, roomId));
};

export const handleUpdateRoom = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  roomId: string,
  info?: string,
  checkIn?: Date,
  checkOut?: Date,
  price?: number,
  capacity?: number,
  metadata?: object
) => {
  return await lock.acquire("resourseLock", () => {
    const room = getRoom(tripId, splitId, hotelId, roomId);
    room.updateInfo(info, metadata);
    room.updateDates(checkIn, checkOut);
    room.updatePrice(price, capacity);

    return room.wellformed();
  });
};

export const handleRemoveRoom = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  roomId: string
) => {
  return await lock.acquire("resourseLock", () => {
    const hotel = getHotel(tripId,splitId, hotelId);
    hotel.removeRoom(roomId);
  });
};

export const handleGetDays = async (tripId: string, splitId?: string): Promise<Array<Day>> => {
  return await lock.acquire("resourseLock", () => {
    return (splitId) ? getSplit(tripId,splitId).days : getTrip(tripId).listDays();
  })
    
}

export const handleGetDay = async (tripId: string, splitId: string, dayId: string): Promise<Day> => {
  return await lock.acquire("resourseLock", () => {
    return getDay(tripId,splitId,dayId);
  })
}

export const handleNewDay = async (tripId: string, splitId: string, info: string, date: Date): Promise<string> => {
  return await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId,splitId);
    const newDay = new Day(split.generateDayId(),info,date);
    split.addDay(newDay);
    return newDay.id;
  })
}

export const handleUpdateDay = async (tripId: string, splitId: string, dayId: string, info: string, date: Date, metadata: object): Promise<boolean> => {
  return await lock.acquire("resourseLock", () => {
    const day = getDay(tripId,splitId,dayId);
    day.updateInfo(info, metadata);
    if (date) day.date = date;
    return day.wellformed();
  })
}

export const handleRemoveDay = async (tripId: string, splitId: string, dayId: string): Promise<void> => {
  await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId,splitId);
    split.removeDay(dayId);
  })
}


const getTrip = (tripId: string): Trip => {
  const trip = trips[tripId];
  if (!trip) throw new AccessError("Trip does not exist");
  return trip;
};

const getSplit = (tripId: string, splitId: string): TripSegment => {
  const trip = getTrip(tripId);
  const split = trip.getSplit(splitId);
  if (!split) throw new AccessError("Split does not exist");
  return split;
};


const getHotel = (tripId: string, splitId: string, hotelId: string): Hotel => {
  const split = getSplit(tripId, splitId);
  const hotel = split.getHotel(hotelId);
  if (!hotel) throw new AccessError("Hotel does not exist");
  return hotel;
};

const getRoom = (tripId: string, splitId: string, hotelId: string, roomId: string): Room => {
  const hotel = getHotel(tripId, splitId, hotelId);
  const room = hotel.getRoom(roomId);
  if (!room) throw new AccessError("Room does not exist");
  return room;
};

const getDay = (tripId: string, splitId: string, dayId: string): Day => {
  const split = getSplit(tripId, splitId);
  const day = split.getDay(dayId)
  if (!day) throw new AccessError ("Day does not exist");
  return day;
}