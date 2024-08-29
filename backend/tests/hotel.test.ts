import Hotel from "../src/Hotel/Hotel";
import Person from "../src/Hotel/Person";
import Room from "../src/Hotel/Room";

describe("Hotel Tests", () => {
  test("Hotel Defined", () => {
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "1", name:"a"}]);
    const twinRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 2,[{id: "1", name:"a"},{id:"2",name:"b"}]);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here");
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom,twinRoom]);
    expect(myEmptyHotel).toBeDefined();
    expect(myHotel).toBeDefined();

  });
  test("Test Add Person", () => {
    const myPerson: Person = {id:"John1",name:"John"}
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[myPerson]);
    const emptyRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[emptyRoom]);
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom]);

    // Room doesnt exist
    expect(() => myHotel.addPerson("0",myPerson)).toThrow();
  
    // person already exists inside Hotel
    expect(() => myHotel.addPerson("1",myPerson)).toThrow();
    
    myEmptyHotel.addPerson("1",myPerson);
    expect(myEmptyHotel).toStrictEqual(myHotel);
    
  });
  test("Test Remove Person", () => {
    const myPerson: Person = {id:"John1",name:"John"}
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[myPerson]);
    const emptyRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[emptyRoom]);
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom]);

    // Room doesnt exist
    expect(() => myEmptyHotel.removePerson("0","John1")).toThrow();
    // person already exists inside Hotel
    expect(myHotel.removePerson("1","John1")).toStrictEqual(myPerson);
    
    expect(myEmptyHotel).toStrictEqual(myHotel);
    
  });
  test("Test Add Room", () => {
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "1", name:"a"}]);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here");
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom]);
    myEmptyHotel.addRoom(singleRoom);
    expect(myEmptyHotel).toStrictEqual(myHotel);
    
  });
  test("Test Remove Room", () => {
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "1", name:"a"}]);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here");
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom]);
    
    expect(() => myHotel.removeRoom("0")).toThrow();
    expect(myHotel.removeRoom("1")).toStrictEqual(singleRoom);
    expect(myEmptyHotel).toStrictEqual(myHotel);
  });
});