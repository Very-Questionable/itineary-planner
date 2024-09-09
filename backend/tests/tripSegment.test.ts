import Activity, { Activities } from "../src/Activities/Activity.js";
import Day from "../src/Activities/Day.js";
import FreeDayItineary from "../src/Activities/FreeDayItineary.js";
import SplitDayItineary from "../src/Activities/SplitDayItineary.js";
import WholeDayItineary from "../src/Activities/WholeDayItineary.js";
import Hotel from "../src/Hotel/Hotel.js";
import Person from "../src/Hotel/Person.js";
import Room from "../src/Hotel/Room.js";
import TripSegment from "../src/Trip/TripSegment.js";

const beforeDate = new Date(Date.parse("2018-01-01"));
const afterDate = new Date(Date.parse("2020-01-01"));
const startdate = new Date(Date.parse("2019-01-01"));
const date2 = new Date(Date.parse("2019-01-02"));
const date3 = new Date(Date.parse("2019-01-03"));
const enddate = new Date(Date.parse("2019-01-04"));

const myPerson1: Person = { id: "1", name: "John1" };

const singleRoom = new Room("1", "myRoom", startdate, enddate, 230, 1, [
  myPerson1,
]);
const roomUnassigned = new Room("2", "myRoom", startdate, enddate, 230, 1);

const myHotel = new Hotel("1", "myRoom", startdate, enddate, "Here", [
  singleRoom,
]);
const myHotelUnassigned = new Hotel("1", "myRoom", startdate, enddate, "Here", [
  roomUnassigned,
]);

const activity: Activity = {
  id: "1",
  name: "name",
  info: "hello",
  location: "here",
};
const activities: Activities = {
  morning: [
    { id: "2", name: "name", info: "hello", location: "here" },
    { id: "3", name: "name", info: "hello", location: "here" },
    { id: "4", name: "name", info: "hello", location: "here" },
  ],
  night: [
    { id: "5", name: "name", info: "hello", location: "here" },
    { id: "6", name: "name", info: "hello", location: "here" },
  ],
};

const freeItineary = new FreeDayItineary("1", "1");
const wholeItineary = new WholeDayItineary("2", "2", activity);
const splitItineary = new SplitDayItineary("3", "3", activities);
const day1 = new Day("1", "?", startdate, [freeItineary]);
const day2 = new Day("2", "?", date2, [wholeItineary]);
const day3 = new Day("3", "?", date3, [splitItineary]);
const day4 = new Day("3", "?", enddate, [splitItineary]);

describe("TripSegment Hotel Integration", () => {
  test("compiles", () => {
    const testSegment = new TripSegment("t", "t", startdate, enddate);
    expect(testSegment).toBeDefined();
  });

  test("Add/Remove Traveller", () => {
    const testSegment = new TripSegment("t", "t", startdate, enddate);
    testSegment.addTraveller(myPerson1);
    expect(testSegment.travellers).toContain(myPerson1);
    expect(() => testSegment.addTraveller(myPerson1)).toThrow();

    expect(testSegment.removeTraveller(myPerson1.id)).toStrictEqual(myPerson1);
    expect(() => testSegment.removeTraveller(myPerson1.id)).toThrow();
    expect(testSegment.travellers).toStrictEqual([]);
  });

  test("Add/Remove hotel", () => {
    const testSegment = new TripSegment("t", "t", startdate, enddate);

    testSegment.addHotel(myHotel);
    expect(testSegment.hotels).toContain(myHotel);
    expect(() => testSegment.addHotel(myHotel)).toThrow();

    expect(testSegment.removeHotel(myHotel.id)).toStrictEqual(myHotel);
    expect(() => testSegment.removeHotel(myHotel.id)).toThrow();
    expect(testSegment.containsHotel(myHotel.id)).toBeFalsy();
  });

  test("Assign/Unassign from hotel", () => {
    const testSegment = new TripSegment("t", "t", startdate, enddate);

    testSegment.addHotel(myHotelUnassigned);
    testSegment.addTraveller(myPerson1);

    expect(() =>
      testSegment.assignRoom("0", roomUnassigned.id, myPerson1.id)
    ).toThrow();
    expect(() =>
      testSegment.assignRoom(myHotelUnassigned.id, "0", myPerson1.id)
    ).toThrow();
    expect(() =>
      testSegment.assignRoom(myHotelUnassigned.id, roomUnassigned.id, "0")
    ).toThrow();
    testSegment.assignRoom(
      myHotelUnassigned.id,
      roomUnassigned.id,
      myPerson1.id
    );
    expect(
      testSegment
        .getHotel(myHotelUnassigned.id)!
        .getRoom(roomUnassigned.id)!
        .getPerson(myPerson1.id)
    ).toStrictEqual(myPerson1);

    expect(() =>
      testSegment.unassignRoom("0", roomUnassigned.id, myPerson1.id)
    ).toThrow();
    expect(() =>
      testSegment.unassignRoom(myHotelUnassigned.id, "0", myPerson1.id)
    ).toThrow();
    expect(() =>
      testSegment.unassignRoom(myHotelUnassigned.id, roomUnassigned.id, "0")
    ).toThrow();

    expect(
      testSegment.unassignRoom(
        myHotelUnassigned.id,
        roomUnassigned.id,
        myPerson1.id
      )
    ).toStrictEqual(myPerson1);
    expect(
      testSegment
        .getHotel(myHotelUnassigned.id)!
        .getRoom(roomUnassigned.id)!
        .getPerson(myPerson1.id)
    ).toBeUndefined();
    expect(() =>
      testSegment.unassignRoom(
        myHotelUnassigned.id,
        roomUnassigned.id,
        myPerson1.id
      )
    ).toThrow();
  });
});

const invalidBefore = new Day("1", "2", beforeDate);
const invalidAfter = new Day("1", "2", afterDate);

describe("TripSegment Activities Integration", () => {
  test("Add/Remove Day", () => {
    const testSegment = new TripSegment("t", "t", startdate, enddate);
    testSegment.addHotel(myHotelUnassigned);
    testSegment.addTraveller(myPerson1);
    testSegment.addDay(day2);
    expect(testSegment.getDay(day2.id)).toStrictEqual(day2);

    expect(() => testSegment.addDay(day2)).toThrow(); // Day id used
    expect(() => testSegment.addDay(invalidAfter)).toThrow(); // before
    expect(() => testSegment.addDay(invalidBefore)).toThrow(); // after

    expect(testSegment.removeDay(day2.id)).toStrictEqual(day2);
    expect(testSegment.getDay(day2.id)).toBeUndefined();
  });

  test("Add/Remove Itineary", () => {
    const testDay = new Day("1", "test day", date2);
    testDay.addItineary(freeItineary);
    expect(testDay.getItineary(freeItineary.id)).toStrictEqual(freeItineary);
    expect(() => testDay.addItineary(freeItineary)).toThrow();

    expect(() => testDay.removeItineary("0")).toThrow();
    expect(testDay.removeItineary(freeItineary.id)).toStrictEqual(freeItineary);
    expect(testDay.getItineary(freeItineary.id)).toBeUndefined();
  });
});

describe("TripSegment Wellformed", () => {
  test("wellformedness", () => {
    const myDays = [day1, day3, day2, day4]; // order doesnt matter since it should sort
    const testSegment = new TripSegment(
      "t",
      "t",
      startdate,
      enddate,
      [myPerson1],
      [myHotel],
      myDays
    );
    expect(testSegment.wellformed()).toBeTruthy();
  });

  test("Days wellformedness", () => {
    const invalidDay3 = day3;
    invalidDay3.id = "hello"
    const myDays = [day1, day3, invalidDay3, day4];
    const testSegment = new TripSegment(
      "t",
      "t",
      startdate,
      enddate,
      [myPerson1],
      [myHotel],
      myDays
    );
    expect(testSegment.wellformed()).toBeFalsy();
  });
});
