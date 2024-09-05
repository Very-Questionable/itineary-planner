import fs from "fs"
import Trip from "./Trip/Trip.js"
import User from "./Auth/User.js";
import Info from "./Info.js";
import AsyncLock from "async-lock"
import TripSegment from "./Trip/TripSegment.js";
import Person from "./Hotel/Person.js";
import { AccessError } from "./Error/error.js";

export interface UserMap {[key: string]: User}
export interface TripMap {[key: string]: Trip}
let users: UserMap = {};
let trips: TripMap = {}; 
const DATABASE_PATH = './database.json'

const lock = new AsyncLock();

export const update = async (users: UserMap, trips: TripMap) => {
  await lock.acquire('saveData', async () => {
    await fs.writeFile(DATABASE_PATH ,JSON.stringify({
      users,
      trips
    }), err => {
      if (err) throw new Error("Failed to write to database");
    });
  });
} 

export const getUsers = ():UserMap => users;
export const getTrips = ():TripMap => trips;

export const save = () => update(users,trips);

export const generateUserId = (): string => {
  let genId = "user" + Info.generateId();
  while (users[genId]) genId = "user" + Info.generateId();
  return genId;
}

export const generateTripId = (): string => {
  let genId = "trip" + Info.generateId();
  while (users[genId]) genId = "trip" + Info.generateId();
  return genId;
}

export const reset = async () => {
  users = {};
  trips = {};
  await update({},{});  
}

try { 
  const data = JSON.parse(fs.readFileSync(DATABASE_PATH).toString());
  users = data.users;
  trips = data.trips;
} catch {
  console.log('WARNING: No database found, create a new one');
  save();
}

export const resourceLock = (callback:CallableFunction) =>
  new Promise((resolve, reject) => {
    lock.acquire('resourceLock', callback(resolve, reject));
  });

export const handleCreateNewTrip = async (info:string, start:Date, end:Date, travellers?:Array<Person>, splits?:Array<TripSegment>, metadata?:object):Promise<string> => {
  return await lock.acquire('resourceLock', async () => {
    const newTrip = new Trip(generateTripId(),info, start, end, travellers, splits, metadata);
    trips[newTrip.id] = newTrip;
    await save()
    return newTrip.id    
  });
}

export const handleGetTrip = (tripId: string): Trip => {
  if (!trips[tripId]) throw new AccessError ("Trip does not exist");
  return trips[tripId];
}

export const handleUpdateTrip = async (tripId:string, info?:string, start?:Date, end?:Date, travellers?:Array<Person>, splits?:Array<TripSegment>, metadata?:object) => {
  await lock.acquire('resourseLock', async () => {
    const target = trips[tripId];
    if (!target) throw new AccessError ("Trip does not exist");
    target.updateInfo(info, metadata);
    if (travellers) travellers.forEach((t:Person) => target.addTraveller(t));
    if (splits) splits.forEach((s:TripSegment) => target.addSplit(s));
    if (start) target.start = start;
    if (end) target.end = end;

    trips[tripId] = target;
  })
}

export const handleDeleteTrip = async (tripId:string) => {
  await lock.acquire('resourseLock', async () => {
    if (!trips[tripId]) throw new AccessError ("Trip does not exist");
    trips = Object.keys(trips).filter(objKey =>
      objKey !== tripId).reduce((newObj:TripMap, key:string) => {
          newObj[key] = trips[key];
          return newObj;
      }, {})
  })
}