import Hotel from "../src/Hotel/Hotel";
import Person from "../src/Hotel/Person";
import Room from "../src/Hotel/Room";
import TripSegment from "../src/Trip/TripSegment";

const startdate = new Date(Date.parse("2019-01-01"))
const enddate = new Date(Date.parse("2019-01-04"));

const myPerson1: Person = {id:"1",name:"John1"}
const myPerson2: Person = {id:"2",name:"John2"}

const singleRoom = new Room("1","myRoom", startdate, enddate, 230, 1,[myPerson1]);
const roomUnassigned = new Room("2","myRoom", startdate, enddate, 230, 1);

const myHotel = new Hotel("1","myRoom", startdate, enddate,"Here",[singleRoom]);
const myHotelUnassigned = new Hotel("1","myRoom", startdate, enddate,"Here",[roomUnassigned]);

const validBooked = new Hotel("1","myRoom", startdate, enddate,"Here",[singleRoom, singleRoom3]);
    
describe("TripSegment Hotel Integration", () => {
  test("compiles", () => {
    const testSegment = new TripSegment("t","t", startdate,enddate)
    expect(testSegment).toBeDefined();
    
  })
 
  test("Add/Remove Traveller", () => {
    const testSegment = new TripSegment("t","t", startdate,enddate)
    testSegment.addTraveller(myPerson1);
    expect(testSegment.travellers).toContain(myPerson1);
    expect(() => testSegment.addTraveller(myPerson1)).toThrow();

    expect(testSegment.removeTraveller(myPerson1.id)).toStrictEqual(myPerson1);
    expect(() => testSegment.removeTraveller(myPerson1.id)).toThrow();
    expect(testSegment.travellers).toStrictEqual([]);
  });

  test("Add/Remove hotel", () => {
    const testSegment = new TripSegment("t","t", startdate,enddate)

    testSegment.addHotel(myHotel);
    expect(testSegment.hotels).toContain(myHotel);
    expect(() => testSegment.addHotel(myHotel)).toThrow();

    expect(testSegment.removeHotel(myHotel.id)).toStrictEqual(myHotel);
    expect(() => testSegment.removeHotel(myHotel.id)).toThrow();
    expect(testSegment.removeHotel).toStrictEqual([]);
    
  });

  test("Assign/Unassign from hotel", () => {
    const testSegment = new TripSegment("t","t", startdate,enddate)

    testSegment.addHotel(myHotelUnassigned);
    testSegment.addTraveller(myPerson1);

    expect(() => testSegment.assignRoom("0", roomUnassigned.id, myPerson1.id)).toThrow();
    expect(() => testSegment.assignRoom(myHotelUnassigned.id, "0", myPerson1.id)).toThrow();
    expect(() => testSegment.assignRoom(myHotelUnassigned.id, roomUnassigned.id, "0")).toThrow();
    testSegment.assignRoom(myHotelUnassigned.id, roomUnassigned.id, myPerson1.id);
    expect(testSegment.getHotel(myHotelUnassigned.id)!.getRoom(roomUnassigned.id)!.getPerson(myPerson1.id)).toStrictEqual(myPerson1);
    
    expect(() => testSegment.unassignRoom("0", roomUnassigned.id, myPerson1.id)).toThrow();
    expect(() => testSegment.unassignRoom(myHotelUnassigned.id, "0", myPerson1.id)).toThrow();
    expect(() => testSegment.unassignRoom(myHotelUnassigned.id, roomUnassigned.id, "0")).toThrow();
    
    expect(testSegment.unassignRoom(myHotelUnassigned.id, roomUnassigned.id, myPerson1.id)).toStrictEqual(myPerson1);
    expect(testSegment.getHotel(myHotelUnassigned.id)!.getRoom(roomUnassigned.id)!.getPerson(myPerson1.id)).toBeUndefined();
    expect(() => testSegment.unassignRoom(myHotelUnassigned.id, roomUnassigned.id, myPerson1.id)).toThrow();

  });



});


describe("TripSegment Activities Integration", () => {
  
  test("Add Day", () => {

  });

  test("Remove Day", () => {
    
  })
  
  test("Wellformed", () => {

  });
});

describe("TripSegment Wellformed", () => {
  
})