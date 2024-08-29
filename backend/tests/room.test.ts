import Room from "../src/Hotel/Room";

describe("Room Tests", () => {
  test("Test room Defined", () => {
    const room = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 2);
    expect(room).toBeDefined();
    const room1 = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 2,[{id: "john1", name:"john beans"}]);
    expect(room1).toBeDefined();
    
  });

  test("Add person", () => {
    const expected = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "john1", name:"john beans"}]);
    const room = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1);
    room.addPerson({id: "john1", name:"john beans"});
    expect(() => room.addPerson({id: "john1", name:"john beans"})).toThrow();
    expect(expected.persons).toStrictEqual(room.persons);
    expect(() => room.addPerson({id: "john2", name:"john beans2"})).toThrow();
  });

  test("Remove person", () => {
    const expected = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1);
    const room = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "john1", name:"john beans"}]);
    expect(() => room.removePerson("jo")).toThrow();
    expect(room.removePerson("john1")).toStrictEqual({id: "john1", name:"john beans"});
    expect(expected.persons).toStrictEqual(room.persons);
    expect(() => room.removePerson("john1")).toThrow();

  });

  test("Wellformed - fully booked", () => {
    const wellformed = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "john1", name:"john beans"}]);
    const mallformed = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 2,[{id: "john1", name:"john beans"}]);
    expect(wellformed.wellformed()).toBeTruthy();
    expect(mallformed.wellformed()).toBeFalsy();
  });
  
  test("Price", () => {
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "1", name:"a"}]);
    const twinRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 2,[{id: "1", name:"a"},{id:"2",name:"b"}]);
    
    // Price Per person
    expect(singleRoom.pricePP()).toStrictEqual(singleRoom.price/1);
    expect(twinRoom.pricePP()).toStrictEqual(twinRoom.price/2);
    
    // Price Per day
    expect(singleRoom.pricePPperDay()).toStrictEqual(singleRoom.price/3);
    expect(twinRoom.pricePPperDay()).toStrictEqual(twinRoom.price/6);
  });

})