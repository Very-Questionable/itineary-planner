import Person from "./Person";

export default class Room {
    id: string
	price: number
	persons: Array<Person>
    capacity: number
    

    // Partially Filled room
    constructor (roomId:string, price:number, capacity:number, persons?:Array<Person>) {
        this.price = price;
        this.capacity = capacity;
        this.persons = persons ? persons! : [];
        this.id = roomId;
    }

	
	/**
     * addPerson
     */
    public addPerson(newPerson:Person) {
        if (this.persons.length + 1 > this.capacity) {
            throw new Error("Capacity for this room has been reach");
        }

        this.persons.push(newPerson);
    }

    /**
     * removePerson
     */
    public removePerson(personId: String) {
        if (!this.persons.some(person => personId === person.id)) {
            throw new Error("Invalid person Id, cannot find person");
        }

        this.persons = this.persons.filter((person) => personId !== person.id);
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

}