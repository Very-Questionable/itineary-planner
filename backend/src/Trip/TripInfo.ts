import { InputError } from "../Error/error.js";
import Person from "../Hotel/Person.js";
import Info from "../Info.js";

export default abstract class TripInfo extends Info {
  end: Date;
  start: Date;
  travellers: Array<Person>;
  constructor(
    id: string,
    info: string,
    start: Date,
    end: Date,
    travelers?: Array<Person>,
    metadata?: object
  ) {
    if (start > end) throw new InputError("Start date after End Date");
    super(id, info, metadata);
    this.start = start;
    this.end = end;
    this.travellers = travelers ? travelers! : [];
  }

  public updateDates(start?: Date, end?: Date) {
    const newStart: Date = start ? start : this.start;
    const newEnd: Date = end ? end : this.end;
    if (newStart > newEnd)
      throw new InputError("Start after end");
    this.start = newStart;
    this.end = newEnd;

  }

  /**
   * addTraveller
   */
  public addTraveller(traveller: Person) {
    if (this.containsTraveller(traveller.id))
      throw new Error("Traveller already added");
    this.travellers.push(traveller);
  }

  /**
   * Util function: Contains traveller: checks if a person is in a trip
   * @param id: person ID
   * @returns
   */
  public containsTraveller(id: string): boolean {
    return this.travellers.some((traveller) => traveller.id === id);
  }

  /**
   * Util function: Attempts to get a traveller: checks if a person is in a trip
   * @param id: person ID
   * @returns Maybe Person
   */
  public getTraveller(id: string): Person | undefined {
    return this.travellers.find((traveller) => traveller.id === id);
  }

  /**
   *
   * @param id Person Id to remove
   */
  public removeTraveller(id: string): Person {
    const target = this.getTraveller(id);
    if (!target) throw new Error("Traveller does not exist");
    this.travellers = this.travellers.filter((person) => person.id !== id);

    return target;
  }

  /**
   * returns duration of stay in nights
   */
  public duration(): number {
    return Math.floor(
      Math.abs(this.end.getTime() - this.start.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }
}
