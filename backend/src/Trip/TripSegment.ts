import Day from "../Activities/Day.js";
import { AccessError, InputError } from "../Error/error.js";
import Hotel from "../Hotel/Hotel.js";
import Person from "../Hotel/Person.js";
import Info from "../Info.js";
import { HotelMap } from "../Server/interfaces.js";
import TripInfo from "./TripInfo.js";

export default class TripSegment extends TripInfo {
  days: Array<Day>;
  hotels: HotelMap = {};

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
    hotels?.forEach(h => this.addHotel(h));
    this.days = days
      ? days!.sort((a, b) => a.date.getTime() - b.date.getTime())
      : [];
  }

  private containsDate(date: Date): boolean {
    return this.days.some((day) => day.date === date);
  }

  public addDay(day: Day) {
    if (day.date < this.start) throw new InputError("Date before split start");
    if (day.date > this.end) throw new InputError("Date after split end");
    if (this.containsDay(day.id)) throw new AccessError("Day id already added");
    if (this.containsDate(day.date)) throw new InputError("Day already added");
    this.days.push(day);
    this.days.sort((a, b) => (new Date(a.date)).getTime() - (new Date(b.date)).getTime());
  }

  /**
   * Adds a new hotel to the segment
   * @param hotel
   */
  public addHotel(hotel: Hotel) {
    if (this.containsHotel(hotel.id))
      throw new AccessError("Hotel already added");
    this.hotels[hotel.id] = hotel;
  }

  /**
   * Assigns a room to a traveller
   * @param hotelId 
   * @param roomId 
   * @param travelerId 
   */
  public assignRoom(hotelId: string, roomId: string, travelerId: string) {
    const targetTraveller = this.getTraveller(travelerId);
    const targetHotel = this.getHotel(hotelId);

    if (!targetTraveller) throw new AccessError("Traveller does not exist");
    if (!targetHotel) throw new AccessError("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId))
      throw new AccessError("Room does not exist");
    if (Object.values(this.hotels).some((hotel) => hotel.containsPerson(travelerId)))
      throw new InputError("Traveller already has a room");

    targetHotel.addPerson(roomId, targetTraveller);
  }

  public containsDay(id: string): boolean {
    return this.days.some((day) => day.id === id);
  }

  public containsHotel(id: string): boolean {
    return id in this.hotels; 
  }

  public generateDayId(): string {
    let genId = "Day" + Info.generateId();
    while(this.containsDay(genId)) genId = "Day" + Info.generateId();
    return genId;
  }

  public generateHotelId(): string {
    let genId = "Hotel" + Info.generateId();
    while(this.containsHotel(genId)) genId = "Hotel" + Info.generateId();
    return genId;
  }

  public getDay(id: string): Day | undefined {
    return this.days.find((day) => day.id === id);
  }

  public getHotel(id: string): Hotel | undefined {
    return this.hotels[id]; 
  }

  public removeDay(id: string): Day {
    const target = this.days.find((d) => d.id === id);
    if (!target) throw new AccessError("Day does not exist");
    this.days = this.days.filter((d) => d.id !== id);
    this.days.sort((a, b) => a.date.getDate() - b.date.getDate());

    return target;
  }

  public removeHotel(id: string): Hotel {
    const target = this.getHotel(id);
    if (!target) throw new AccessError("Hotel does not exist");
    delete this.hotels[id];
    return target;
  }

  public removeTraveller(id: string): Person {
    const target = super.removeTraveller(id);
    Object.values(this.hotels).forEach(h => {
      Object.values(h.rooms).forEach(r => {
        if (r.containsPerson(id)) r.removePerson(id);
      })
    });
    return target;
  }

  /**
   * Removes a traveller from a room
   * @param hotelId 
   * @param roomId 
   * @param personId 
   * @returns 
   */
  public unassignRoom(
    hotelId: string,
    roomId: string,
    personId: string
  ): Person {
    const targetHotel = this.getHotel(hotelId);
    if (!targetHotel) throw new AccessError("Hotel does not exist");
    if (!targetHotel.containsRoom(roomId))
      throw new AccessError("Room does not exist");

    return targetHotel.removePerson(roomId, personId);
  }

  public updateDates(start?: Date, end?: Date) {
    super.updateDates(start,end);
    Object.values(this.hotels).forEach(h => h.updateDates(start,end));
  }

  public updateTraveller(travellerId: string, name?: string, requireBooking: boolean = true, metadata?: object) {
    super.updateTraveller(travellerId, name, requireBooking,metadata);
    Object.values(this.hotels).forEach(h => Object.values(h.rooms).forEach(r => {
      const person = r.getPerson(travellerId);
      if (person) {
        if (name) person.name = name;
        person.requireBooking = requireBooking;
        if (metadata) person.metadata = metadata;
      }
    }))
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
    const bookedTravellers = Object.values(this.hotels).flatMap((hotel) =>
      hotel.listPersons()
    );
    const bookedCond =
      Object.values(this.travellers).every(
        (person) =>
          person.requireBooking || bookedTravellers.some((p) => p === person)
      ) && bookedTravellers.length === Object.values(this.travellers).length;
    const wellformedHotelsCond = Object.values(this.hotels).every((hotel) =>
      hotel.wellformed()
    );
    const boundaryCond = Object.values(this.hotels).every(
      (hotel) => hotel.checkIn === this.start && hotel.checkOut === this.end
    );
    const wellformedDays = this.days.every((day) => day.wellformed());
    const areDaysSequential = this.days.map((day) =>
      Math.floor((new Date(day.date)).getTime() / (1000 * 60 * 60 * 24))
    );
    const sequentialCond = areDaysSequential
      .map((t) => t - areDaysSequential[0]!)
      .every((v, i) => v === i);

    return (
      bookedCond &&
      wellformedHotelsCond &&
      boundaryCond &&
      wellformedDays &&
      sequentialCond
    );
  }
}
