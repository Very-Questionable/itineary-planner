import { InputError } from "../Error/error.js";
import Person from "../Hotel/Person.js";
import Info from "../Info.js";
import { TravellerMap } from "../Server/interfaces.js";

export default abstract class TripInfo extends Info {
  end: Date;
  start: Date;
  travellers: TravellerMap = {};
  constructor(
    id: string,
    info: string,
    start: Date,
    end: Date,
    travellers?: Array<Person>,
    metadata?: object
  ) {
    if (start > end) throw new InputError("Start date after End Date");
    super(id, info, metadata);
    this.start = start;
    this.end = end;
    travellers?.forEach(t => this.addTraveller(t));
  }

  /**
   * addTraveller
   */
  public addTraveller(traveller: Person) {
    if (this.containsTraveller(traveller.id))
      throw new InputError("Traveller already added");
    this.travellers[traveller.id] = traveller;
  }

  /**
   * Util function: Contains traveller: checks if a person is in a trip
   * @param id: person ID
   * @returns
   */
  public containsTraveller(id: string): boolean {
    return id in this.travellers; 
  }

  /**
   * returns duration of stay in nights
   */
  public duration(): number {
    return Math.floor(
      Math.abs((new Date(this.end)).getTime() - (new Date(this.start)).getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Util function: Attempts to get a traveller: checks if a person is in a trip
   * @param id: person ID
   * @returns Maybe Person
   */
  public getTraveller(id: string): Person | undefined {
    return this.travellers[id]; 
  }

  /**
   *
   * @param id Person Id to remove
   */
  public removeTraveller(id: string): Person {
    const target = this.getTraveller(id);
    if (!target) throw new Error("Traveller does not exist");
    delete this.travellers[id];
    return target;
  }

  public updateDates(start?: Date, end?: Date) {
    const newStart: Date = start ? start : this.start;
    const newEnd: Date = end ? end : this.end;
    if (newStart > newEnd)
      throw new InputError("Start after end");
    this.start = newStart;
    this.end = newEnd;
  }

  public updateTraveller(travellerId: string, name?: string, requireBooking: boolean = true, metadata?: object) {
    const target = this.getTraveller(travellerId)
    if (!target) return;
    if (name) target.name = name;
    target.requireBooking = requireBooking;
    if (metadata) target.metadata = metadata;
  }
}
