import Day from "../Activities/Day";
import Hotel from "../Hotel/Hotel";
import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";

export default class TripSegment extends TripInfo {
  private days: Array<Day>;
  hotels: Array<Hotel>;
  constructor(
    id: string,
    info: string,
    start: Date,
    end: Date,
    travellers?: Array<Person>,
    hotels?: Array<Hotel>,
    days?: Array<Day>
  ) {
    super(id, info, start, end, travellers);
    this.hotels = hotels ? hotels! : [];
    this.days = days ? days! : [];
  }

  private containsDay(id: string): boolean {
    return this.days.some((day) => day.id === id);
  }

  private getDay(id: string): Day | undefined {
    return this.days.find((day) => day.id === id);
  }

  public addDay(day: Day) {
    if (!this.getDay(day.id))
      throw new Error("Day already added");
    this.days.push(day);
    this.days.sort((a, b) => a.date.getDate() - b.date.getDate());
  }

  /**
   * Adds a new hotel to the segment
   * @param hotel
   */
  public addHotel(hotel: Hotel) {
    if (this.containsHotel(hotel.id))
      throw new Error("Hotel already added");
    this.hotels.push(hotel);
  }

  public assignRoom(hotelId: string, roomId: string, travelerId: string) {
    const targetTraveller = this.travellers.find(
      (traveler) => traveler.id === travelerId
    );
    const targetHotel = this.getHotel(hotelId);
    if (!targetTraveller) throw new Error("Traveller does not exist");
    if (!targetHotel) throw new Error("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId))
      throw new Error("Room does not exist");
    if (this.hotels.some((hotel) => hotel.containsPerson(travelerId)))
      throw new Error("Traveller already has a room");

    targetHotel.addPerson(roomId, targetTraveller);
  }

  containsHotel(id: string): boolean {
    return this.hotels.some((hotel) => hotel.id === id);
  }

  getHotel(id: string): Hotel | undefined {
    return this.hotels.find((hotel) => hotel.id === id);
  }

  public removeDay(id: string): Day {
    const target = this.days.find((d) => d.id === id);
    if (!target) throw new Error("Day does not exist");
    this.days = this.days.filter((d) => d.id !== id);
    this.days.sort((a, b) => a.date.getDate() - b.date.getDate());

    return target;
  }

  public removeHotel(id: string): Hotel {
    const target = this.getHotel(id) 
    if (!target) throw new Error("Hotel does not exist");
    this.hotels = this.hotels.filter((hotel) => hotel.id !== id);

    return target;
  }

  public unassignRoom(
    hotelId: string,
    roomId: string,
    personId: string
  ): Person {
    const targetHotel = this.getHotel(hotelId); 
    if (!targetHotel) throw new Error("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId))
      throw new Error("Room does not exist");

    return targetHotel.removePerson(roomId, personId);
  }

  /**
   * Wellformed if
   *  - Hotels account for all travelers
   *  - Hotels are all wellformed
   *  - Hotel start and end dates match Trip segment start and end dates
   *  - Days Matches duration
   *  - Days are all wellformed and in sorted order
   *  - There are no skipped days
   */
  wellformed(): boolean {
    throw new Error("Method not implemented.");
  }
}
