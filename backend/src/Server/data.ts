import fs from "fs";
import Trip from "../Trip/Trip.js";
import Info from "../Info.js";
import AsyncLock from "async-lock";
import TripSegment from "../Trip/TripSegment.js";
import Person from "../Hotel/Person.js";
import { AccessError, InputError } from "../Error/error.js";
import Hotel from "../Hotel/Hotel.js";
import Day from "../Activities/Day.js";
import Room from "../Hotel/Room.js";
import FreeDayItineary from "../Activities/FreeDayItineary.js";
import SplitDayItineary from "../Activities/SplitDayItineary.js";
import WholeDayItineary from "../Activities/WholeDayItineary.js";
import Activity, { Activities } from "../Activities/Activity.js";
import { TripMap } from "./interfaces.js";


let trips: TripMap = {};

const DATABASE_PATH = "./database.json";

const lock = new AsyncLock();

export const update = async (trips: TripMap) => {
  await lock.acquire("saveData", async () => {
    await fs.writeFile(
      DATABASE_PATH,
      JSON.stringify({
        trips,
      }),
      (err) => {
        if (err) throw new Error("Failed to write to database");
      }
    );
  });
};

export const getTrips = (): TripMap => trips;

export const save = () => update(trips);

export const generateTripId = (): string => {
  let genId = "Trip" + Info.generateId();
  while (trips[genId]) genId = "trip" + Info.generateId();
  return genId;
};

export const reset = async () => {
  trips = {};
  await update({});
};

try {
  const data = JSON.parse(fs.readFileSync(DATABASE_PATH).toString());
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
  end: Date
): Promise<string> => {
  return await lock.acquire("resourceLock", async () => {
    const newTrip = new Trip(generateTripId(), info, start, end);
    trips[newTrip.id] = newTrip;
    return newTrip.id;
  });
};

export const handleGetTrip = async (tripId: string): Promise<Trip> => {
  return await lock.acquire("resourseLock", () => {
    return getTrip(tripId);
  });
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
  metadata?: object
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
    const targetSplit = getSplit(tripId, splitId);
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
    const targetHotel = getHotel(tripId, splitId, hotelId);
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
    const hotel = getHotel(tripId, splitId, hotelId);
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
    const hotel = getHotel(tripId, splitId, hotelId);
    return hotel.rooms;
  });
};

export const handleGetRoom = async (
  tripId: string,
  splitId: string,
  hotelId: string,
  roomId: string
): Promise<Room> => {
  return await lock.acquire("resourseLock", () =>
    getRoom(tripId, splitId, hotelId, roomId)
  );
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
    const hotel = getHotel(tripId, splitId, hotelId);
    hotel.removeRoom(roomId);
  });
};

export const handleGetDays = async (
  tripId: string,
  splitId?: string
): Promise<Array<Day>> => {
  return await lock.acquire("resourseLock", () => {
    return splitId
      ? getSplit(tripId, splitId).days
      : getTrip(tripId).listDays();
  });
};

export const handleGetDay = async (
  tripId: string,
  splitId: string,
  dayId: string
): Promise<Day> => {
  return await lock.acquire("resourseLock", () => {
    return getDay(tripId, splitId, dayId);
  });
};

export const handleNewDay = async (
  tripId: string,
  splitId: string,
  info: string,
  date: Date
): Promise<string> => {
  return await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId, splitId);
    const newDay = new Day(split.generateDayId(), info, date);
    split.addDay(newDay);
    return newDay.id;
  });
};

export const handleUpdateDay = async (
  tripId: string,
  splitId: string,
  dayId: string,
  info?: string,
  date?: Date,
  metadata?: object
): Promise<boolean> => {
  return await lock.acquire("resourseLock", () => {
    const day = getDay(tripId, splitId, dayId);
    day.updateInfo(info, metadata);
    if (date) day.date = date;
    return day.wellformed();
  });
};

export const handleRemoveDay = async (
  tripId: string,
  splitId: string,
  dayId: string
): Promise<void> => {
  await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId, splitId);
    split.removeDay(dayId);
  });
};

export const handleGetItinearies = async (
  tripId: string,
  splitId: string,
  dayId: string
) => {
  return await lock.acquire("resourseLock", () => {
    const day = getDay(tripId,splitId,dayId);
    return day.itinearies;
  });
};

export const handleGetItineary = async (
  tripId: string,
  splitId: string,
  dayId: string,
  itinearyId: string
) => {
  return await lock.acquire("resourseLock", () => {
    return getItineary(tripId,splitId,dayId,itinearyId);
  });
 
};

interface ActivityPayload {
  activities?: Activities;
  activity?: Activity;
}

export const handleNewItineary = async (
  tripId: string,
  splitId: string,
  dayId: string,
  info: string,
  itinearyType: string,
  activityPayload: ActivityPayload
  
): Promise<string> => {
  return await lock.acquire("resourseLock", () => {
    const day = getDay(tripId,splitId,dayId);
    console.log(itinearyType);
    const newIt = (itinearyType === "FreeDayItineary") ? new FreeDayItineary(day.generateItinearyId(), info)
                : (itinearyType === "SplitDayItineary") ? new SplitDayItineary(day.generateItinearyId(), info, activityPayload.activities!)
                : (itinearyType === "WholeDayItineary") ? new WholeDayItineary(day.generateItinearyId(), info, activityPayload.activity!)
                : undefined;
    if (!newIt) throw new InputError("Itinerary Type is Undefined");
    day.addItineary(newIt);
    return newIt.id;
  })
};

export const handleUpdateItineary = async (
tripId: string, splitId: string, dayId: string, itinearyId: string, info?: string, activityPayload?: ActivityPayload, metadata?: object): Promise<boolean> => {
  return await lock.acquire("resourseLock", () => {
    const it = getItineary(tripId,splitId,dayId,itinearyId);
    it.updateInfo(info,metadata);
    if (activityPayload) {
      if (it instanceof WholeDayItineary) it.updateActivity(activityPayload.activity); 
      if (it instanceof SplitDayItineary) it.updateActivities(activityPayload.activities); 
    }
    return it.wellformed();
  });
};

export const handleRemoveItineary = async (
  tripId: string,
  splitId: string,
  dayId: string,
  itinearyId: string
) => {
  return await lock.acquire("resourseLock", () => {
    const day = getDay(tripId,splitId,dayId);
    day.removeItineary(itinearyId);
  })  
};
/**
 * Traveller functions
 */

export const handleGetTravellers = async (tripId: string) => {
  return await lock.acquire("resourseLock", () => {
    const trip = getTrip(tripId);
    return trip.travellers;
  })  
}

export const handleGetTraveller = async (tripId: string, travellerId: string) => {
  return await lock.acquire("resourseLock", () => getTraveller(tripId, travellerId));  
}

export const handleNewTraveller = async (tripId: string, name: string, requireBooking: boolean = true, metadata?: object) => {
  return await lock.acquire("resourseLock", () => {
    const trip = getTrip(tripId);
    const newTraveller: Person = {
      id: trip.generateTravellerId(),
      requireBooking: requireBooking,
      name: name,
    }
    if (metadata) newTraveller.metadata = metadata;
    trip.addTraveller(newTraveller)
    return newTraveller.id;

  })  
}

export const handleUpdateTraveller = async (tripId: string, travellerId: string, name?: string, requireBooking?: boolean, metadata?: object) => {
  return await lock.acquire("resourseLock", () => {
    const trip = getTrip(tripId);
    trip.updateTraveller(travellerId, name, requireBooking, metadata);
    return trip.wellformed();
    
  })  
}

export const handleRemoveTraveller = async (tripId: string, travellerId: string) => {
  return await lock.acquire("resourseLock", () => {
    const trip = getTrip(tripId);
    trip.removeTraveller(travellerId);
    return trip.wellformed();
    
  })  
}

export const handleAssignRoom = async (tripId: string, splitId: string, hotelId: string, roomId: string, travellerId: string) => {
  return await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId, splitId);
    split.assignRoom(hotelId,roomId,travellerId);
    return; 
  })  
}

export const handleUnassignRoom = async (tripId: string, splitId: string, hotelId: string, roomId: string, travellerId: string) => {
  return await lock.acquire("resourseLock", () => {
    const split = getSplit(tripId, splitId);
    split.unassignRoom(hotelId,roomId,travellerId);
    return;
  })  
}

/**
 * Helper functions, Wrapper for obtaining trips
 * @param tripId 
 * @returns 
 */

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

const getRoom = (
  tripId: string,
  splitId: string,
  hotelId: string,
  roomId: string
): Room => {
  const hotel = getHotel(tripId, splitId, hotelId);
  const room = hotel.getRoom(roomId);
  if (!room) throw new AccessError("Room does not exist");
  return room;
};

const getDay = (tripId: string, splitId: string, dayId: string): Day => {
  const split = getSplit(tripId, splitId);
  const day = split.getDay(dayId);
  if (!day) throw new AccessError("Day does not exist");
  return day;
};

const getItineary = (tripId:string, splitId: string, dayId: string, itinearyId: string) => {
  const day = getDay(tripId,splitId,dayId);
  const itineary = day.getItineary(itinearyId);
  if (!itineary) throw new AccessError("Itineary does not exist");
  return itineary;
}

const getTraveller = (tripId: string, travellerId: string): Person => {
  const trip = getTrip(tripId);
  const traveller = trip.getTraveller(travellerId);
  if (!traveller) throw new AccessError("Traveller does not exist");
  return traveller;
}