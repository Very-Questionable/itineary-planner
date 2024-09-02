import Day from "../Activities/Day";
import Hotel from "../Hotel/Hotel";
import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";

export default class TripSegment extends TripInfo {
  days: Array<Day>;
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
    this.days = days
      ? days!.sort((a, b) => a.date.getTime() - b.date.getTime())
      : [];
  }

  public containsDay(id: string): boolean {
    return this.days.some((day) => day.id === id);
  }

  public getDay(id: string): Day | undefined {
    return this.days.find((day) => day.id === id);
  }

  public addDay(day: Day) {
    if (day.date < this.start) throw new Error("Date before split start");
    if (day.date >= this.end) throw new Error("Date after split end");
    if (this.containsDay(day.id)) throw new Error("Day already added");
    this.days.push(day);
    this.days.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Adds a new hotel to the segment
   * @param hotel
   */
  public addHotel(hotel: Hotel) {
    if (this.containsHotel(hotel.id)) throw new Error("Hotel already added");
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

  public containsHotel(id: string): boolean {
    return this.hotels.some((hotel) => hotel.id === id);
  }

  public getHotel(id: string): Hotel | undefined {
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
    const target = this.getHotel(id);
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
    const bookedTravellers = this.hotels.flatMap((hotel) =>
      hotel.listPersons()
    );
    const bookedCond =
      this.travellers.every(
        (person) =>
          person.requireBooking || bookedTravellers.some((p) => p === person)
      ) && bookedTravellers.length === this.travellers.length;
    const wellformedHotelsCond = this.hotels.every((hotel) =>
      hotel.wellformed()
    );
    const boundaryCond = this.hotels.every(
      (hotel) => hotel.checkIn === this.start && hotel.checkOut === this.end
    );
    const wellformedDays = this.days.every((day) => day.wellformed());
    const dayDurationCond = this.days.length === this.duration();
    const areDaysSequential = this.days.map((day) =>
      Math.abs(day.date.getTime() / (1000 * 60 * 60 * 24))
    );
    const sequentialCond = areDaysSequential
      .map((t) => t - areDaysSequential[0])
      .every((v, i) => v === i);
    return (
      bookedCond &&
      wellformedHotelsCond &&
      boundaryCond &&
      dayDurationCond &&
      wellformedDays &&
      sequentialCond
    );
  }
}
