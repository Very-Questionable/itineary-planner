import HotelInfo from "./HotelInfo"
import Person from "./Person"
import Room from "./Room"

export default class Hotel extends HotelInfo {
  wellformed(): boolean {
    throw new Error("Method not implemented.")
  }
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
}