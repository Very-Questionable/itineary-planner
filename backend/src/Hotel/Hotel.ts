import Person from "./Person"
import Room from "./Room"

export default class Hotel {
  checkIn: Date
  checkOut: Date
  location: String
  price: Number
  rooms: Array<Room>

  constructor(checkIn:Date, checkOut:Date, location:String, rooms:Array<Room>) {
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.location = location;
    this.rooms = rooms;
  }

  /**
   * AddRoom
   */
  public AddRoom(newRoom:Room) {
    this.rooms.push(newRoom);
  } 

  /**
   * AddPerson
   */
  public AddPerson(roomId:String, person:Person) {
    let target:Room|undefined = this.rooms.find(room => room.id === roomId);
    if (!target) {
      throw new Error("Room does not exist");
    }

    target.addPerson(person);
  }
  
}