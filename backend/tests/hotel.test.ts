import Hotel from "../src/Hotel/Hotel";
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
    
  });
  test("Test Remove Person", () => {
    
  });
  test("Test Add Room", () => {
    
  });
  test("Test Remove Room", () => {
    const singleRoom = new Room("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")), 230, 1,[{id: "1", name:"a"}]);
    const myEmptyHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here");
    const myHotel = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom]);
    myEmptyHotel.AddRoom(singleRoom);
    expect(myEmptyHotel).toStrictEqual(myHotel);
  });
});