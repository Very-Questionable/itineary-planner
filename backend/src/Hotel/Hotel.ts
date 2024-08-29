import HotelInfo from "./HotelInfo"
import Person from "./Person"
import Room from "./Room"

export default class Hotel extends HotelInfo {
  location: string
  rooms: Array<Room>
  
  constructor(id:string, info: string, checkIn:Date, checkOut:Date, location:string, rooms?:Array<Room>) {
    super(id, info, checkIn, checkOut);
    
    this.location = location;
    this.rooms = rooms ? rooms! : [];
  }
  
  /**
   * AddRoom
  */
  public addRoom(room:Room) {
    if (this.rooms.some(r => r.id === room.id)) throw new Error("Room Id in use");
    this.rooms.push(room);
  } 
  
  /**
   * 
   * @param roomId - id of room
  */
  removeRoom(roomId: string): Room {
    const target: Room | undefined = this.rooms.find(room => room.id === roomId);
    if (!target) throw new Error("Room does not exist");
   
    this.rooms = this.rooms.filter(room => room.id !== roomId);
    return target;
  }
  /**
   * addPerson
  */
  public addPerson(roomId:string, person:Person) {
    const target:Room|undefined = this.rooms.find(room => room.id === roomId);
    if (!target) {
      throw new Error("Room does not exist");
    }

    target.addPerson(person);
  }
  
  removePerson(roomId: string, personId: string): Person {
    const target: Room | undefined = this.rooms.find(room => room.id === roomId);
    if (!target) throw new Error("Room does not exist");
    
    return target.removePerson(personId);
  }
  /**
   * Clears all rooms
  */
  public clear(): void {
    this.rooms = [];
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
    const allRooms = this.rooms.map(room => room.id);
    const nubbedRooms = new Set(allRooms); 

    // Unique people ids
    const allPeople = this.rooms.flatMap(room => room.persons);
    const nubbedPeople = new Set(allRooms);

    return this.rooms.length > 0 &&
          allRooms.length === nubbedRooms.size &&
           allPeople.length === nubbedPeople.size && 
           this.rooms.every(room => room.wellformed() &&
                room.checkIn.getDate() === this.checkIn.getDate() &&
                room.checkOut.getDate() === this.checkOut.getDate()
              );
  }
}