import HotelInfo from "./HotelInfo";
import Person from "./Person";

export default class Room extends HotelInfo {

  price: number
  persons: Array<Person>
  capacity: number
  
  // Partially Filled room
  constructor (id:string, info:string, checkIn: Date, checkOut: Date, price:number, capacity:number, persons?:Array<Person>) {
    super(id,info,checkIn,checkOut);
    this.price = price;
    this.capacity = capacity;
    this.persons = persons ? persons! : [];
  }
  
  
  /**
   * addPerson
  */
   public addPerson(newPerson:Person) {
    if (this.persons.some(person => person.id === newPerson.id)) throw new Error("Person id in use");
    if (this.persons.length + 1 > this.capacity) {
      throw new Error("Capacity for this room has been reach");
    }
    
    this.persons.push(newPerson);
  }
  
  /**
   * removePerson
  */
   public removePerson(personId: string): Person {
    const target: Person|undefined = this.persons.find(person => personId === person.id)   
    if (!target) {
      throw new Error("Invalid person Id, cannot find person");
    }
    
    this.persons = this.persons.filter((person) => personId !== person.id);
    return target!;
  }
  
  /**
   * 
   * @param id 
   * @returns if the room contains a person with the required id
   */
  public containsPerson(id:string): boolean {
    return this.persons.some(person => person.id === id);
  }
  
  /**
   * Clear: Clears all persons
   */
  public clear(): void {
    this.persons = [];
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
     return this.price / this.capacity 
  }
  
  /**
   * pricePPperDay
  */
   public pricePPperDay() {
     return this.price / (this.capacity * this.duration()) 
  }

  /**
   * Wellformed if at capacity
   */
  wellformed(): boolean {
    return this.persons.length === this.capacity && this.capacity > 0;
  }

}