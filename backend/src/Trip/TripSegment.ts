import Day from "../Activities/Day";
import Hotel from "../Hotel/Hotel";
import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";

export default class TripSegment extends TripInfo {
  
  hotels: Array<Hotel>;
  days: Array<Day>;
  
  constructor(id: string, info: string, start: Date, end: Date, 
    travellers?: Array<Person>,
    hotels?: Array<Hotel>,
    days?: Array<Day>
  ) {
    super(id,info,start,end, travellers);
    this.hotels = hotels ? hotels! : [];
    this.days = days ? days! : [];
    
  }
  
  /**
   * addTraveller
   */
  public addTraveller(traveller: Person) {
    if (!this.travellers.some(person => person.id === traveller.id)) throw new Error ("Traveller already added");
    this.travellers.push(traveller);
  }

  /**
   * 
   * @param id Person Id to remove
   */
  public removeTraveller(id: string): Person {
    const target = this.travellers.find(person => person.id === id);
    if (!target) throw new Error ("Traveller does not exist");
    this.travellers = this.travellers.filter(person => person.id !== id);
    
    return target;
  }

  /**
   * Adds a new hotel to the segment
   * @param hotel 
   */
  public addHotel(hotel: Hotel) {
    if (!this.hotels.some(h => h.id === hotel.id)) throw new Error ("Hotel already added");
    this.hotels.push(hotel);
  }

  public removeHotel(id: string): Hotel {
    const target = this.hotels.find(hotel => hotel.id === id);
    if (!target) throw new Error ("Hotel does not exist");
    this.hotels = this.hotels.filter(hotel => hotel.id !== id);
    
    return target;
  }

  public addDay(day:Day) {
    if (!this.days.some(d => d.id === day.id)) throw new Error ("Day already added");
    this.days.push(day);
    this.days.sort((a, b) => a.date.getDate() - b.date.getDate());
  }

  public removeDay(id:string): Day {
    const target = this.days.find(d => d.id === id);
    if (!target) throw new Error ("Day does not exist");
    this.days = this.days.filter(d => d.id !== id);
    this.days.sort((a, b) => a.date.getDate() - b.date.getDate());
    
    return target;
  }

  public addPerson(hotelId: string, roomId:string, traveler: Person) {
    const targetHotel = this.hotels.find(hotel => hotel.id === hotelId);
    if (!targetHotel) throw new Error ("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId)) throw new Error("Room does not exist");
    if (this.hotels.some(hotel => hotel.containsPerson(traveler.id)))
      throw new Error("Traveller already has a room");

    targetHotel.addPerson(roomId, traveler);
    if (!this.travellers.some(person => person.id == traveler.id)) {
      this.addTraveller(traveler);
    }


  }

  public removePerson(hotelId: string, roomId:string, personId: string): Person {
    const targetHotel = this.hotels.find(hotel => hotel.id === hotelId);
    if (!targetHotel) throw new Error ("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId)) throw new Error("Room does not exist");

    return targetHotel.removePerson(roomId, personId);
  }



  /**
   * Wellformed if
   *  - Hotels account for all travelers
   *  - Hotels are all wellformed
   *  - Hotel start and end dates match Trip segment start and end dates
   *  - Days Matches duration
   *  - Days are all wellformed and in sorted order
   */
  wellformed(): boolean {
    throw new Error("Method not implemented.");
  }
}