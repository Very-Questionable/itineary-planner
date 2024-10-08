import request from "supertest";
import server from "../src/Server/server.js";
import Activity, { Activities } from "../src/Activities/Activity.js";
// import util from "util";
const postTry = async (
  path: string,
  status: number,
  payload: object,
  token = null
) => sendTry("post", path, status, payload, token);

const getTry = async (
  path: string,
  status: number,
  payload: object,
  token = null
) => sendTry("get", path, status, payload, token);

const deleteTry = async (
  path: string,
  status: number,
  payload: object,
  token = null
) => sendTry("delete", path, status, payload, token);

const putTry = async (
  path: string,
  status: number,
  payload: object,
  token = null
) => sendTry("put", path, status, payload, token);

const sendTry = async (
  typeFn: string,
  path: string,
  status = 200,
  payload = {},
  token = null
) => {
  let req = request(server);
  if (token !== null) {
    req = req.set("Authorization", `Bearer ${token}`);
  }
  const req2 =
    typeFn === "post"
      ? req.post(path)
      : typeFn === "get"
      ? req.get(path)
      : typeFn === "delete"
      ? req.delete(path)
      : typeFn === "put"
      ? req.put(path)
      : req.put(path);
  const response = await req2.send(payload);
  // console.log(
  //   util.inspect(response.body, {
  //     showHidden: false,
  //     depth: null,
  //     colors: true,
  //   })
  // );
  expect(response.statusCode).toBe(status);
  return response.body;
};

const startdate = new Date(Date.parse("2019-01-01"));
const day2 = new Date(Date.parse("2019-01-02"));
const day3 = new Date(Date.parse("2019-01-03"));
const day4 = new Date(Date.parse("2019-01-04"));
// const day5 = new Date(Date.parse("2019-01-04"));
const endDate = new Date(Date.parse("2019-01-06"));

beforeAll(async () => {
  await deleteTry("/clear", 200, {});
});

afterAll(async () => {
  await deleteTry("/clear", 200, {});
});

describe("Routes testing", () => {
  test("Trip test", async () => {
    const trip1 = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });
    const id1 = trip1.tripId;
    const trip2 = await postTry("/trips/new", 200, {
      info: "Hello2",
      start: startdate,
      end: endDate,
    });

    const { trips } = await getTry("/trips", 200, {});
    expect(trips[id1].info).toStrictEqual("Hello");
    expect(Date.parse(trips[id1].start)).toStrictEqual(startdate.getTime());
    expect(Date.parse(trips[id1].end)).toStrictEqual(endDate.getTime());

    const id2 = trip2.tripId;
    expect(trips[id2].info).toStrictEqual("Hello2");
    expect(Date.parse(trips[id2].start)).toStrictEqual(startdate.getTime());
    expect(Date.parse(trips[id2].end)).toStrictEqual(endDate.getTime());

    const myTrip1 = await getTry(`/trips/${id1}`, 200, {});
    expect(myTrip1.trip).toStrictEqual(trips[id1]);

    await deleteTry(`/trips/remove/${id1}`, 200, {});

    await getTry(`/trips/${id1}`, 403, {});

    await putTry(`/trips/update/${id2}`, 200, {
      info: "Hello3",
    });
    const res3 = await getTry(`/trips/${id2}`, 200, {});

    expect(res3.trip.info).toStrictEqual("Hello3");
    expect(Date.parse(res3.trip.start)).toStrictEqual(startdate.getTime());
    expect(Date.parse(res3.trip.end)).toStrictEqual(endDate.getTime());
  });
  test("Splits test", async () => {
    const trip1 = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    const id1 = trip1.tripId;

    const { trips } = await getTry("/trips", 200, {});
    expect(trips[id1].info).toStrictEqual("Hello");
    expect(Date.parse(trips[id1].start)).toStrictEqual(startdate.getTime());
    expect(Date.parse(trips[id1].end)).toStrictEqual(endDate.getTime());

    const s1 = await postTry(`/splits/new/${id1}`, 200, {
      info: "Hello",
      start: startdate,
      end: day3,
    });
    const s2 = await postTry(`/splits/new/${id1}`, 200, {
      info: "Hello2",
      start: day3,
      end: endDate,
    });

    const splitId1 = s1.splitId;
    const splitId2 = s2.splitId;

    const allSplits = await getTry(`/splits/${id1}`, 200, {});

    const split1 = await getTry(`/splits/${id1}/${splitId1}`, 200, {});
    const split2 = await getTry(`/splits/${id1}/${splitId2}`, 200, {});
    expect(allSplits.splits).toStrictEqual([split1.split, split2.split]);

    await deleteTry(`/splits/remove/${id1}/${splitId1}`, 200, {});
    await getTry(`/splits/${id1}/${splitId1}`, 403, {});

    await putTry(`/splits/update/${id1}/${splitId2}`, 200, {
      info: "Hello3",
      start: day2,
    });

    const res3 = await getTry(`/splits/${id1}/${splitId2}`, 200, {});
    expect(res3.split.info).toStrictEqual("Hello3");
    expect(Date.parse(res3.split.start)).toStrictEqual(day2.getTime());
    expect(Date.parse(res3.split.end)).toStrictEqual(endDate.getTime());
  });

  test("Hotel", async () => {
    const { tripId } = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    const { splitId } = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    const res = await postTry(`/hotels/new/${tripId}/${splitId}`, 200, {
      info: "Hotel",
      checkIn: startdate,
      checkOut: endDate,
      location: "Town",
    });

    expect(res.hotelId).toStrictEqual(expect.any(String));

    const res2 = await postTry(`/hotels/new/${tripId}/${splitId}`, 200, {
      info: "Hotel2",
      checkIn: startdate,
      checkOut: endDate,
      location: "Town2",
    });

    expect(res2.hotelId).toStrictEqual(expect.any(String));

    const { hotels } = await getTry(`/hotels/${tripId}/${splitId}`, 200, {});

    const hotel1 = await getTry(
      `/hotels/${tripId}/${splitId}/${res.hotelId}`,
      200,
      {}
    );
    const hotel2 = await getTry(
      `/hotels/${tripId}/${splitId}/${res2.hotelId}`,
      200,
      {}
    );
    expect(Object.values(hotels)).toStrictEqual([hotel1.hotel, hotel2.hotel]);

    await deleteTry(
      `/hotels/remove/${tripId}/${splitId}/${res.hotelId}`,
      200,
      {}
    );
    await getTry(`/hotels/${tripId}/${splitId}/${res.hotelId}`, 403, {});

    await putTry(`/hotels/update/${tripId}/${splitId}/${res2.hotelId}`, 200, {
      location: "Hello3",
      checkIn: day2,
    });

    const res3 = await getTry(
      `/hotels/${tripId}/${splitId}/${res2.hotelId}`,
      200,
      {}
    );
    expect(res3.hotel.location).toStrictEqual("Hello3");
    expect(Date.parse(res3.hotel.checkIn)).toStrictEqual(day2.getTime());
    expect(Date.parse(res3.hotel.checkOut)).toStrictEqual(endDate.getTime());
  });

  test("Room tests", async () => {
    const { tripId } = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    const { splitId } = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    const { hotelId } = await postTry(`/hotels/new/${tripId}/${splitId}`, 200, {
      info: "Hotel",
      checkIn: startdate,
      checkOut: endDate,
      location: "Town",
    });

    const r1 = await postTry(
      `/rooms/new/${tripId}/${splitId}/${hotelId}`,
      200,
      {
        info: "room1",
        price: 200,
        capacity: 1,
      }
    );

    const r2 = await postTry(
      `/rooms/new/${tripId}/${splitId}/${hotelId}`,
      200,
      {
        info: "room2",
        price: 300,
        capacity: 1,
      }
    );

    const { rooms } = await getTry(
      `/rooms/${tripId}/${splitId}/${hotelId}`,
      200,
      {}
    );
    const room1 = await getTry(
      `/rooms/${tripId}/${splitId}/${hotelId}/${r1.roomId}`,
      200,
      {}
    );
    const room2 = await getTry(
      `/rooms/${tripId}/${splitId}/${hotelId}/${r2.roomId}`,
      200,
      {}
    );
    expect(Object.values(rooms)).toStrictEqual([room1.room, room2.room]);

    await deleteTry(
      `/rooms/remove/${tripId}/${splitId}/${hotelId}/${r1.roomId}`,
      200,
      {}
    );
    await getTry(
      `/rooms/${tripId}/${splitId}/${hotelId}/${room1.roomId}`,
      403,
      {}
    );

    await putTry(
      `/rooms/update/${tripId}/${splitId}/${hotelId}/${r2.roomId}`,
      200,
      {
        price: 200,
        capacity: 2,
      }
    );
    const res3 = await getTry(
      `/rooms/${tripId}/${splitId}/${hotelId}/${r2.roomId}`,
      200,
      {}
    );
    expect(res3.room.capacity).toStrictEqual(2);
    expect(res3.room.price).toStrictEqual(200);
  });

  test("Day tests", async () => {
    const { tripId } = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    console.log(tripId);

    const s1 = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Split1",
      start: startdate,
      end: day3,
    });

    const s2 = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Split2",
      start: day3,
      end: endDate,
    });

    console.log(s1, s2);
    const d1 = await postTry(`/days/new/${tripId}/${s1.splitId}`, 200, {
      info: "day1",
      date: day2,
    });

    const d2 = await postTry(`/days/new/${tripId}/${s2.splitId}`, 200, {
      info: "day2",
      date: day4,
    });
    const d3 = await postTry(`/days/new/${tripId}/${s2.splitId}`, 200, {
      info: "day3",
      date: day3,
    });
    console.log(d1, d2, d3);

    const allDays = await getTry(`/days/${tripId}`, 200, {});
    const partialDays = await getTry(`/days/${tripId}/${s2.splitId}`, 200, {});

    const day1Test = await getTry(
      `/days/${tripId}/${s1.splitId}/${d1.dayId}`,
      200,
      {}
    );
    const day2Test = await getTry(
      `/days/${tripId}/${s2.splitId}/${d2.dayId}`,
      200,
      {}
    );
    const day3Test = await getTry(
      `/days/${tripId}/${s2.splitId}/${d3.dayId}`,
      200,
      {}
    );
    expect(allDays.days).toStrictEqual([
      day1Test.day,
      day3Test.day,
      day2Test.day,
    ]);
    expect(partialDays.days).toStrictEqual([day3Test.day, day2Test.day]);

    await putTry(`/days/update/${tripId}/${s2.splitId}/${d3.dayId}`, 200, {
      info: "hello3",
      date: endDate,
      metadata: { hello: "world" },
    });
    const day3Updated = await getTry(
      `/days/${tripId}/${s2.splitId}/${d3.dayId}`,
      200,
      {}
    );
    expect(day3Updated.day.info).toStrictEqual("hello3");
    expect(day3Updated.day.metadata).toBeDefined();
    expect(day3Updated.day.metadata).toStrictEqual({ hello: "world" });
    expect(Date.parse(day3Updated.day.date)).toStrictEqual(endDate.getTime());

    await deleteTry(
      `/days/remove/${tripId}/${s2.splitId}/${d3.dayId}`,
      200,
      {}
    );
    await getTry(`/days/${tripId}/${s2.splitId}/${d3.dayId}`, 403, {});
  });

  test("Itinearies", async () => {
    const myActivity: Activity = {
      id: "1",
      name: "nabewari",
      info: "udon",
      location: "nabewari",
    };
    const myActivity2: Activity = {
      id: "2",
      name: "deer",
      info: "shikanokonokonokokoshitantan",
      location: "nara",
    };

    const myActivity3: Activity = {
      id: "3",
      name: "deer",
      info: "shikanokonokonokokoshitantan",
      location: "nara",
    };
    const myActivity4: Activity = {
      id: "4",
      name: "deer",
      info: "shikanokonokonokokoshitantan",
      location: "nara",
    };
    const myActivities: Activities = {
      morning: [myActivity],
      afternoon: [myActivity2, myActivity3, myActivity4],
    };
    const { tripId } = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: endDate,
    });

    console.log(tripId);

    const { splitId } = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Split1",
      start: startdate,
      end: day3,
    });

    const { dayId } = await postTry(`/days/new/${tripId}/${splitId}`, 200, {
      info: "day1",
      date: startdate,
    });

    const freeDay = await postTry(
      `/itinearies/new/${tripId}/${splitId}/${dayId}`,
      200,
      {
        info: "Free Day",
        itinearyType: "FreeDayItineary",
      }
    );

    const wholeDay = await postTry(
      `/itinearies/new/${tripId}/${splitId}/${dayId}`,
      200,
      {
        info: "whole Day",
        itinearyType: "WholeDayItineary",
        activityPayload: { activity: myActivity },
      }
    );

    const splitDay = await postTry(
      `/itinearies/new/${tripId}/${splitId}/${dayId}`,
      200,
      {
        info: "split Day",
        itinearyType: "SplitDayItineary",
        activityPayload: { activities: myActivities },
      }
    );

    console.log(freeDay, wholeDay, splitDay);

    const { itinearies } = await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}`,
      200,
      {}
    );
    const freeDetail = await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}/${freeDay.itinearyId}`,
      200,
      {}
    );
    const wholeDetail = await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}/${wholeDay.itinearyId}`,
      200,
      {}
    );
    const splitDetail = await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}/${splitDay.itinearyId}`,
      200,
      {}
    );

    expect(Object.values(itinearies)).toStrictEqual([
      freeDetail.itineary,
      wholeDetail.itineary,
      splitDetail.itineary,
    ]);
    expect(freeDetail.itinearyType).toStrictEqual("FreeDayItineary");
    expect(splitDetail.itinearyType).toStrictEqual("SplitDayItineary");
    expect(wholeDetail.itinearyType).toStrictEqual("WholeDayItineary");
    myActivities.afternoon?.pop();

    await putTry(
      `/itinearies/update/${tripId}/${splitId}/${dayId}/${splitDay.itinearyId}`,
      200,
      {
        activityPayload: { activities: myActivities },
      }
    );
    const newSplit = await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}/${splitDay.itinearyId}`,
      200,
      {}
    );
    expect(newSplit.itineary.afternoon).toStrictEqual([
      myActivity2,
      myActivity3,
    ]);

    await deleteTry(
      `/itinearies/remove/${tripId}/${splitId}/${dayId}/${splitDay.itinearyId}`,
      200,
      {}
    );
    await getTry(
      `/itinearies/${tripId}/${splitId}/${dayId}/${splitDay.itinearyId}`,
      403,
      {}
    );
  });

  test("Person tests", async () => {
    const { tripId } = await postTry("/trips/new", 200, {
      info: "Hello",
      start: startdate,
      end: day3,
    });

    console.log(tripId);

    const { splitId } = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Split1",
      start: startdate,
      end: day2,
    });

    const split2 = await postTry(`/splits/new/${tripId}`, 200, {
      info: "Split1",
      start: day2,
      end: day3,
    });

    const date1 = await postTry(`/days/new/${tripId}/${splitId}`, 200, {
      info: "day1",
      date: startdate,
    });

    const date2 = await postTry(`/days/new/${tripId}/${splitId}`, 200, {
      info: "day2",
      date: day2,
    });

    const date3 = await postTry(`/days/new/${tripId}/${split2.splitId}`, 200, {
      info: "day3",
      date: day3,
    });

    await postTry(`/itinearies/new/${tripId}/${splitId}/${date1.dayId}`, 200, {
      info: "Free Day",
      itinearyType: "FreeDayItineary",
    });
    await postTry(`/itinearies/new/${tripId}/${splitId}/${date2.dayId}`, 200, {
      info: "Free Day",
      itinearyType: "FreeDayItineary",
    });
    await postTry(
      `/itinearies/new/${tripId}/${split2.splitId}/${date3.dayId}`,
      200,
      { info: "Free Day", itinearyType: "FreeDayItineary" }
    );
    const hotel1 = await postTry(`/hotels/new/${tripId}/${splitId}`, 200, {
      info: "Hotel",
      checkIn: startdate,
      checkOut: day2,
      location: "Town",
    });
    const hotel2 = await postTry(`/hotels/new/${tripId}/${splitId}`, 200, {
      info: "Hotel2",
      checkIn: startdate,
      checkOut: day2,
      location: "Town",
    });
    const hotel3 = await postTry(
      `/hotels/new/${tripId}/${split2.splitId}`,
      200,
      { info: "Hotel3", checkIn: day2, checkOut: day3, location: "Town" }
    );

    const r1 = await postTry(
      `/rooms/new/${tripId}/${splitId}/${hotel1.hotelId}`,
      200,
      { info: "room1", price: 200, capacity: 1 }
    );
    const r2 = await postTry(
      `/rooms/new/${tripId}/${splitId}/${hotel2.hotelId}`,
      200,
      { info: "room2", price: 200, capacity: 2 }
    );
    const r3 = await postTry(
      `/rooms/new/${tripId}/${split2.splitId}/${hotel3.hotelId}`,
      200,
      { info: "room3", price: 200, capacity: 3 }
    );

    const psn1 = await postTry(`/travellers/new/${tripId}`, 200, {
      name: "person1",
    });
    const psn2 = await postTry(`/travellers/new/${tripId}`, 200, {
      name: "person2",
    });
    const psn3 = await postTry(`/travellers/new/${tripId}`, 200, {
      name: "person3",
    });
    await postTry(
      `/rooms/${tripId}/${splitId}/${hotel1.hotelId}/${r1.roomId}/assign/${psn1.travellerId}`,
      200,
      {}
    );
    await postTry(
      `/rooms/${tripId}/${splitId}/${hotel2.hotelId}/${r2.roomId}/assign/${psn2.travellerId}`,
      200,
      {}
    );
    await postTry(
      `/rooms/${tripId}/${splitId}/${hotel2.hotelId}/${r2.roomId}/assign/${psn3.travellerId}`,
      200,
      {}
    );

    await postTry(
      `/rooms/${tripId}/${split2.splitId}/${hotel3.hotelId}/${r3.roomId}/assign/${psn1.travellerId}`,
      200,
      {}
    );
    await postTry(
      `/rooms/${tripId}/${split2.splitId}/${hotel3.hotelId}/${r3.roomId}/assign/${psn2.travellerId}`,
      200,
      {}
    );
    await postTry(
      `/rooms/${tripId}/${split2.splitId}/${hotel3.hotelId}/${r3.roomId}/assign/${psn3.travellerId}`,
      200,
      {}
    );

    const room1Detail = await getTry(
      `/rooms/${tripId}/${splitId}/${hotel1.hotelId}/${r1.roomId}`,
      200,
      {}
    );
    expect(room1Detail.wellformed).toBeTruthy();
    const room2Detail = await getTry(
      `/rooms/${tripId}/${splitId}/${hotel2.hotelId}/${r2.roomId}`,
      200,
      {}
    );
    expect(room2Detail.wellformed).toBeTruthy();
    const room3Detail = await getTry(
      `/rooms/${tripId}/${split2.splitId}/${hotel3.hotelId}/${r3.roomId}`,
      200,
      {}
    );
    expect(room3Detail.wellformed).toBeTruthy();

    const hotel1Detail = await getTry(
      `/hotels/${tripId}/${splitId}/${hotel1.hotelId}`,
      200,
      {}
    );
    expect(hotel1Detail.wellformed).toBeTruthy();
    const hotel2Detail = await getTry(
      `/hotels/${tripId}/${splitId}/${hotel2.hotelId}`,
      200,
      {}
    );
    expect(hotel2Detail.wellformed).toBeTruthy();
    const hotel3Detail = await getTry(
      `/hotels/${tripId}/${split2.splitId}/${hotel3.hotelId}`,
      200,
      {}
    );
    expect(hotel3Detail.wellformed).toBeTruthy();

    const tripDetails = await getTry(`/trips/${tripId}`, 200, {});
    const splitDetails = await getTry(`/splits/${tripId}/${splitId}`, 200, {});
    const splitDetails2 = await getTry(
      `/splits/${tripId}/${split2.splitId}`,
      200,
      {}
    );
    expect(splitDetails.wellformed).toBeTruthy();
    expect(splitDetails2.wellformed).toBeTruthy();
    expect(tripDetails.wellformed).toBeTruthy();

    const updatedTrav = await putTry(
      `/travellers/update/${tripId}/${psn1.travellerId}`,
      200,
      {
        name: "Per Sona",
        metadata: { hello: "world" },
      }
    );
    expect(updatedTrav.wellformed).toBeTruthy();
    await deleteTry(
      `/travellers/remove/${tripId}/${psn1.travellerId}`,
      200,
      {}
    );
    await getTry(`/travellers/${tripId}/${psn1.travellerId}`, 403, {});
  });
});
