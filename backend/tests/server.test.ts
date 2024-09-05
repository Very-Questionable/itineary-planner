import request from "supertest";
import server from "../src/server.js";

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
  expect(response.statusCode).toBe(status);
  return response.body;
};

const startdate = new Date(Date.parse("2019-01-01"));
const day2 = new Date(Date.parse("2019-01-02"));
const day3 = new Date(Date.parse("2019-01-03"));
// const day4 = new Date(Date.parse("2019-01-04"));
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

    const s1 = await postTry(`/splits/new/${id1}`,200,{
      info: "Hello",
      start: startdate,
      end: day3
    })
    const s2 = await postTry(`/splits/new/${id1}`,200,{
      info: "Hello2",
      start: day3,
      end: endDate
    })

    const splitId1 = s1.splitId;
    const splitId2 = s2.splitId;

    const allSplits = await getTry(`/splits/${id1}`,200,{});

    const split1 = await getTry(`/splits/${id1}/${splitId1}`,200,{});
    const split2 = await getTry(`/splits/${id1}/${splitId2}`,200,{});
    expect(allSplits.splits).toStrictEqual([split1.split, split2.split]);
    
  
    await deleteTry(`/splits/remove/${id1}/${splitId1}`, 200, {});
    await getTry(`/splits/${id1}/${splitId1}`, 403, {});
    
    await putTry(`/splits/update/${id1}/${splitId2}`, 200, {
      info: "Hello3",
      start: day2
    });


    const res3 = await getTry(`/splits/${id1}/${splitId2}`, 200, {});
    expect(res3.split.info).toStrictEqual("Hello3");
    expect(Date.parse(res3.split.start)).toStrictEqual(day2.getTime());
    expect(Date.parse(res3.split.end)).toStrictEqual(endDate.getTime());
  });
});
