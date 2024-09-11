import { AccessError } from "../Error/error.js";
import Info from "../Info.js";
import HotelInfo from "./HotelInfo.js";
import Person from "./Person.js";
import Room from "./Room.js";

export default class Hotel extends HotelInfo {
  location: string;
  rooms: Array<Room>;

  constructor(
    id: string,
    info: string,
    checkIn: Date,
    checkOut: Date,
    location: string,
    rooms?: Array<Room>,
    metadata?: object
  ) {
    super(id, info, checkIn, checkOut, metadata);

    this.location = location;
    this.rooms = rooms ? rooms! : [];
  }

  /**
   * addPerson
   */
  public addPerson(roomId: string, person: Person) {
    const target = this.getRoom(roomId);
    if (!target) {
      throw new AccessError("Room does not exist");
    }

    target.addPerson(person);
  }

  /**
   * AddRoom
   */
  public addRoom(room: Room) {
    console.log(this.rooms)
    if (this.containsRoom(room.id)) throw new Error("Room Id in use");
    this.rooms.push(room);
    console.log(this.rooms)
  }

  /**
   * Clears all rooms
   */
  public clear(): void {
    this.rooms = [];
  }

  public containsPerson(id: string): boolean {
    return this.rooms.some((room) => room.containsPerson(id));
  }

  public containsRoom(id: string): boolean {
    return this.rooms.some((room) => room.id === id);
  }

  public generateRoomId(): string {
    let genId = "Room" + Info.generateId();
    while(this.containsRoom(genId)) genId = "Room" + Info.generateId();
    return genId;
  }

  public getRoom(id: string): Room | undefined {
    return this.rooms.find((room) => room.id === id);
  }

  public listPersons(): Array<Person> {
    return this.rooms.flatMap((room) => Object.values(room.persons));
  }

  public removePerson(roomId: string, personId: string): Person {
    const target = this.getRoom(roomId);
    if (!target) throw new AccessError("Room does not exist");

    return target.removePerson(personId);
  }

  /**
   *
   * @param roomId - id of room
   */
  removeRoom(roomId: string): Room {
    const target = this.getRoom(roomId);
    if (!target) throw new AccessError("Room does not exist");

    this.rooms = this.rooms.filter((room) => room.id !== roomId);
    return target;
  }


  public updateDates(start?: Date, end?: Date) {
    super.updateDates(start,end);
    this.rooms.forEach(r => r.updateDates(start,end));
  }

  /**
   * In a hotel
   *  - CheckIn and CheckOut Days must match
   *  - At least one room must be booked
   *  - All room ids must be unique
   *  - All rooms must be wellformed
   *  - All person ids must be unique
   * @returns Boolean
   */
  wellformed(): boolean {
    // Unique Room ids
    const allRooms = this.rooms.map((room) => room.id);
    const nubbedRooms = new Set(allRooms);

    // Unique people ids
    const allPeople = this.rooms.flatMap((room) => Object.values(room.persons));
    const nubbedPeople = new Set(allPeople);
    return (
      this.rooms.length > 0 &&
      allRooms.length === nubbedRooms.size &&
      allPeople.length === nubbedPeople.size &&
      this.rooms.every(
        (room) =>
          room.wellformed() &&
          (new Date(room.checkIn)).getTime() === (new Date(this.checkIn)).getTime() &&
          (new Date(room.checkOut)).getTime() === (new Date(this.checkOut)).getTime()
      )
    );
  }
}
