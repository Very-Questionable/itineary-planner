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
  public AddRoom(room:Room) {
    this.rooms.push(room);
  } 

  /**
   * AddPerson
   */
  public AddPerson(roomId:string, person:Person) {
    const target:Room|undefined = this.rooms.find(room => room.id === roomId);
    if (!target) {
      throw new Error("Room does not exist");
    }

    target.addPerson(person);
  }
  
}