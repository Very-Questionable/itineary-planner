import { AccessError, InputError } from "../Error/error.js";
import { TravellerMap } from "../Server/interfaces.js";
import HotelInfo from "./HotelInfo.js";
import Person from "./Person.js";

export default class Room extends HotelInfo {
  private capacity: number;
  persons: TravellerMap = {};
  price: number;
  // Partially Filled room
  constructor(
    id: string,
    info: string,
    checkIn: Date,
    checkOut: Date,
    price: number,
    capacity: number,
    persons?: Array<Person>,
    metadata?: object
  ) {
    super(id, info, checkIn, checkOut, metadata);
    this.price = price;
    this.capacity = capacity;
    persons?.forEach(p => this.addPerson(p));
  }

  public updatePrice(price?: number, capacity?: number) {
    this.price = price ? price : this.price;
    this.capacity = capacity ? capacity : this.capacity
  }
  
  /**
   * addPerson
   */
  public addPerson(newPerson: Person) {
    if (this.containsPerson(newPerson.id)) throw new AccessError("Person id in use");
    if (Object.keys(this.persons).length + 1 > this.capacity) {
      throw new InputError("Capacity for this room has been reach");
    }

    this.persons[newPerson.id] = newPerson;
  }

  /**
   * removePerson
   */
  public removePerson(personId: string): Person {
    const target = this.getPerson(personId);
    if (!target) {
      throw new AccessError("Invalid person Id, cannot find person");
    }

    delete this.persons[personId];
    return target;
  }

  /**
   *
   * @param id
   * @returns if the room contains a person with the required id
   */
  public containsPerson(id: string): boolean {
    return this.persons[id] !== undefined;
  }

  /**
   *
   * @param id person id
   * @returns maybe person info
   */
  public getPerson(id: string): Person | undefined {
    return this.persons[id];
  }

  /**
   * Clear: Clears all persons
   */
  public clear(): void {
    this.persons = {};
  }

  /**
   * updateCapacity
   */
  public updateCapacity(newPrice: number, newCapacity: number) {
    this.price = newPrice;
    this.capacity = newCapacity;
  }

  /**
   * pricePP
   */
  public pricePP() {
    return this.price / this.capacity;
  }

  /**
   * pricePPperDay
   */
  public pricePPperDay() {
    return this.price / (this.capacity * this.duration());
  }

  /**
   * Wellformed if at capacity
   */
  wellformed(): boolean {
    return Object.keys(this.persons).length === this.capacity && this.capacity > 0;
  }
}
