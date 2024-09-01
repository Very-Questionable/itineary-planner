import Person from "../Hotel/Person";
import Info from "../Info";

export default abstract class TripInfo extends Info {
  private end: Date;
  private start: Date;
  travellers: Array<Person>;
  constructor(
    id: string,
    info: string,
    start: Date,
    end: Date,
    travelers?: Array<Person>
  ) {
    if (start > end) throw new Error("Start date after end Date");
    super(id, info);
    this.start = start;
    this.end = end;
    this.travellers = travelers ? travelers! : [];
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
}
