import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "../swagger.json";
import { AccessError, InputError } from "./Error/error.js";
import {
  getTrips,
  handleAssignRoom,
  handleCreateNewHotel,
  handleCreateNewRoom,
  handleCreateNewSplit,
  handleCreateNewTrip,
  handleDeleteHotel,
  handleDeleteSplit,
  handleDeleteTrip,
  handleGetDay,
  handleGetDays,
  handleGetHotel,
  handleGetHotels,
  handleGetItinearies,
  handleGetItineary,
  handleGetRoom,
  handleGetRooms,
  handleGetSplit,
  handleGetSplits,
  handleGetTraveller,
  handleGetTravellers,
  handleGetTrip,
  handleNewDay,
  handleNewItineary,
  handleNewTraveller,
  handleRemoveDay,
  handleRemoveItineary,
  handleRemoveRoom,
  handleRemoveTraveller,
  handleUnassignRoom,
  handleUpdateDay,
  handleUpdateHotel,
  handleUpdateItineary,
  handleUpdateRoom,
  handleUpdateSplit,
  handleUpdateTraveller,
  handleUpdateTrip,
  reset,
  save,
} from "./data.js";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan(":method :url :status"));

const catchErrors =
  (fn: CallableFunction) => async (req: Request, res: Response) => {
    try {
      console.log(`Authorization header is ${req.header("Authorization")}`);
      if (req.method === "GET") {
        console.log(`Query params are ${JSON.stringify(req.params)}`);
      } else {
        console.log(`Body params are ${JSON.stringify(req.body)}`);
      }
      await fn(req, res);
      await save();
    } catch (err) {
      if (err instanceof InputError) {
        res.status(400).send({ error: err.message });
      } else if (err instanceof AccessError) {
        res.status(403).send({ error: err.message });
      } else {
        console.log(err);
        res.status(500).send({ error: "A system error ocurred" });
      }
    }
  };

/**
 * User
 */

/******************************************
 * Get Trips
 ******************************************/
app.get(
  "/trips",
  catchErrors(async (req: Request, res: Response) => {
    return res.status(200).json({ trips: getTrips() });
  })
);

app.post(
  "/trips/new",
  catchErrors(async (req: Request, res: Response) => {
    const { info, start, end} = req.body;
    const newTrip = await handleCreateNewTrip(info, start, end);
    return res.status(200).json({ tripId: newTrip });
  })
);

app.get(
  "/trips/:tripId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const trip = await handleGetTrip(tripId);
    return res.status(200).json({ trip: trip, wellformed: trip.wellformed() });
  })
);

app.put(
  "/trips/update/:tripId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const { info, start, end, metadata } = req.body;

    const wellformed = await handleUpdateTrip(
      tripId,
      info,
      start,
      end,
      metadata
    );
    return res.status(200).json({ wellformed: wellformed });
  })
);

app.delete(
  "/trips/remove/:tripId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    await handleDeleteTrip(tripId);
    return res.status(200).json({});
  })
);

/**
|/splits/{tripId}                               |Lists all splits in a trip|GET    |
|/splits/new/{tripId}                           |Creates a new split in a  |POST   |
|/splits/get/{tripId}/{splitId}                 |Gets specific split in a  |GET    |
|/splits/update/{tripId}/{splitId}              |Updates a specific split  |PUT    |
|/splits/remove/{tripId}/{splitId}              |Removes a specific split  |DELETE |
*/
app.post(
  "/splits/new/:tripId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const { info, start, end } = req.body;
    const splitId = await handleCreateNewSplit(tripId, info, start, end);
    return res.status(200).json({ splitId: splitId });
  })
);

app.get(
  "/splits/:tripId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const splits = handleGetSplits(tripId);
    return res.status(200).json({ splits: splits });
  })
);

app.get(
  "/splits/:tripId/:splitId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId } = req.params;
    const split = handleGetSplit(tripId, splitId);
    return res
      .status(200)
      .json({ split: split, wellformed: split.wellformed() });
  })
);

app.put(
  "/splits/update/:tripId/:splitId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId } = req.params;
    const { info, start, end } = req.body;
    await handleUpdateSplit(tripId, splitId, info, start, end);
    return res.status(200).json({});
  })
);

app.delete(
  "/splits/remove/:tripId/:splitId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId } = req.params;
    await handleDeleteSplit(tripId, splitId);
    return res.status(200).json({});
  })
);

/**
 * Utils
 */
app.delete(
  "/clear",
  catchErrors(async (req: Request, res: Response) => {
    await reset();
    return res.status(200).json({});
  })
);

/**
 *
 * |/hotel/{tripId}/{splitId}                      |Lists all hotels          |GET    |
 * |/hotel/{tripId}/{splitId}                      |Lists all hotels          |POST    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Gets specific hotel       |GET    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Update hotel              |PUT    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Removes Hotel             |DELETE |
 *
 */
app.post(
  "/hotels/new/:tripId/:splitId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId } = req.params;
    const { info, checkIn, checkOut, location } = req.body;
    const hotelId = await handleCreateNewHotel(
      tripId,
      splitId,
      info,
      checkIn,
      checkOut,
      location
    );
    return res.status(200).json({ hotelId: hotelId });
  })
);

app.get(
  "/hotels/:tripId/:splitId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId } = req.params;
    const hotels = await handleGetHotels(tripId, splitId);
    return res.status(200).json({ hotels: hotels });
  })
);

app.get(
  "/hotels/:tripId/:splitId/:hotelId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId } = req.params;
    const hotel = await handleGetHotel(tripId, splitId, hotelId);
    return res
      .status(200)
      .json({ hotel: hotel, wellformed: hotel.wellformed() });
  })
);

app.put(
  "/hotels/update/:tripId/:splitId/:hotelId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId } = req.params;
    const { info, checkIn, checkOut, location, metadata } = req.body;
    const wellformed = await handleUpdateHotel(
      tripId,
      splitId,
      hotelId,
      info,
      checkIn,
      checkOut,
      location,
      metadata
    );
    return res.status(200).json({ wellformed: wellformed });
  })
);

app.delete(
  "/hotels/remove/:tripId/:splitId/:hotelId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId } = req.params;
    await handleDeleteHotel(tripId, splitId, hotelId);
    return res.status(200).json({});
  })
);

/**
 *
 * |/rooms/{tripId}/{splitId}/{hotelId}             |Lists Rooms for a hotel   |GET    |
 * |/rooms/{tripId}/{splitId}/{hotelId}             |Creates new Room          |POST   |
 * |/rooms/{tripId}/{splitId}/{hotelId}/{roomId}    |Gets specific room        |GET    |
 * |/rooms/{tripId}/{splitId}/{hotelId}/{roomId}    |updates specific room     |PUT    |
 * |/rooms/{tripId}/{splitId}/{hotelId}/{roomId}    |updates specific room     |DELETE |
 *
 */

app.post(
  "/rooms/new/:tripId/:splitId/:hotelId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId } = req.params;
    const { info, price, capacity } = req.body;
    const roomId = await handleCreateNewRoom(
      tripId,
      splitId,
      hotelId,
      info,
      price,
      capacity
    );
    return res.status(200).json({ roomId });
  })
);

app.get(
  "/rooms/:tripId/:splitId/:hotelId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId } = req.params;
    const rooms = await handleGetRooms(tripId, splitId, hotelId);
    return res.status(200).json({ rooms: rooms });
  })
);

app.get(
  "/rooms/:tripId/:splitId/:hotelId/:roomId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId, roomId } = req.params;
    const room = await handleGetRoom(tripId, splitId, hotelId, roomId);
    return res.status(200).json({ room: room, wellformed: room.wellformed() });
  })
);

app.put(
  "/rooms/update/:tripId/:splitId/:hotelId/:roomId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId, roomId } = req.params;
    const { info, checkIn, checkOut, price, capacity, metadata } =
      req.body;
    const rooms = await handleUpdateRoom(
      tripId,
      splitId,
      hotelId,
      roomId,
      info,
      checkIn,
      checkOut,
      price,
      capacity,
      metadata
    );
    return res.status(200).json({ rooms: rooms });
  })
);

app.delete(
  "/rooms/remove/:tripId/:splitId/:hotelId/:roomId",
  catchErrors(async (req: Request, res: Response) => {
    const { tripId, splitId, hotelId, roomId } = req.params;
    await handleRemoveRoom(tripId, splitId, hotelId, roomId);
    return res.status(200).json({});
  })
);
/**
 * 
|/day/{tripId}/                                 |lists days                |GET    |
|/day/{tripId}/{splitId}                        |list days in a split      |GET    |
|/day/{tripId}/{splitId}                        |add a day to a split      |POST   |
|/day/{tripId}/{splitId}/{dayId}                |Update a day              |PUT    |
|/day/{tripId}/{splitId}/{dayId}                |Removes a day             |DELETE |
*/

app.get("/days/:tripId", catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  const days = await handleGetDays(tripId);
  res.status(200).json({days: days});
}))

app.get("/days/:tripId/:splitId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId} = req.params
  const days = await handleGetDays(tripId, splitId);
  res.status(200).json({days: days});
}))

app.get("/days/:tripId/:splitId/:dayId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId} = req.params
  const day = await handleGetDay(tripId, splitId, dayId);
  res.status(200).json({day: day, wellformed: day.wellformed()});
}))

app.post("/days/new/:tripId/:splitId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId} = req.params;
  const {info, date} = req.body;
  const dayId = await handleNewDay(tripId, splitId, info, date);
  res.status(200).json({dayId: dayId});
}))

app.put("/days/update/:tripId/:splitId/:dayId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId} = req.params;
  const {info, date, metadata} = req.body;
  const wellformed = await handleUpdateDay(tripId, splitId, dayId, info, date, metadata);
  res.status(200).json({wellformed: wellformed});
}))


app.delete("/days/remove/:tripId/:splitId/:dayId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId} = req.params
  await handleRemoveDay(tripId, splitId, dayId);
  res.status(200).json({});
}))

/**
 * Itinearies and Activities
 */
app.get("/itinearies/:tripId/:splitId/:dayId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId} = req.params;
  const itinearies = await handleGetItinearies(tripId,splitId,dayId);
  res.status(200).json({itinearies: itinearies });
}));

app.get("/itinearies/:tripId/:splitId/:dayId/:itineariesId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId, itineariesId} = req.params;
  const itineary = await handleGetItineary(tripId,splitId,dayId, itineariesId);
  res.status(200).json({itineary: itineary, itinearyType: itineary.constructor.name });
}));

app.post("/itinearies/new/:tripId/:splitId/:dayId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId} = req.params;
  const {info, itinearyType, activityPayload} = req.body;
  const itinearyId = await handleNewItineary(tripId,splitId,dayId, info, itinearyType, activityPayload);
  res.status(200).json({itinearyId: itinearyId });
}));

app.put("/itinearies/update/:tripId/:splitId/:dayId/:itinearyId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId, itinearyId} = req.params;
  const {info, activityPayload, metadata} = req.body;
  console.log(req.body)
  const wellformed = await handleUpdateItineary(tripId, splitId, dayId, itinearyId, info, activityPayload, metadata);
  res.status(200).json({ wellformed: wellformed });
}));

app.delete("/itinearies/remove/:tripId/:splitId/:dayId/:itinearyId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, dayId, itinearyId} = req.params;
  await handleRemoveItineary(tripId, splitId, dayId, itinearyId);
  res.status(200).json({});
}));

/**
 * Travellers
 */

app.get("/travellers/:tripId", catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  const travellers = await handleGetTravellers(tripId);
  res.status(200).json({travellers: travellers });
}));

app.get("/travellers/:tripId/:travellerId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, travellerId} = req.params;
  const traveller = await handleGetTraveller(tripId, travellerId);
  res.status(200).json({traveller: traveller });
}));

app.post("/travellers/new/:tripId", catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  const {name, requireBooking, metadata} = req.body;
  const travellerId = await handleNewTraveller(tripId, name, requireBooking, metadata);
  res.status(200).json({travellerId: travellerId });
}));


app.put("/travellers/update/:tripId/:travellerId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, travellerId} = req.params;
  const {name, requireBooking, metadata} = req.body;
  const wellformed = await handleUpdateTraveller(tripId, travellerId, name, requireBooking, metadata);
  res.status(200).json({wellformed: wellformed});
}));

app.delete("/travellers/remove/:tripId/:travellerId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, travellerId} = req.params;
  const wellformed = await handleRemoveTraveller(tripId, travellerId);
  res.status(200).json({wellformed: wellformed});
}));

app.post("/rooms/:tripId/:splitId/:hotelId/:room/assign/:travellerId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, hotelId, roomId, travellerId} = req.params;
  const wellformed = await handleAssignRoom(tripId,splitId,hotelId,roomId, travellerId)
  res.status(200).json({wellformed: wellformed})
}))

app.delete("/rooms/:tripId/:splitId/:hotelId/:room/assign/:travellerId", catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId, hotelId, roomId, travellerId} = req.params;
  await handleUnassignRoom(tripId,splitId,hotelId,roomId, travellerId)
  res.status(200).json({});
}))

/****************************************
 * Run Server
 *****************************************/

app.get("/", (_req, res) => res.redirect("/docs"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const port = 5033;

const server = app.listen(port, () => {
  console.log(`Backend is now listening on port ${port}!`);
  console.log(`For API docs, navigate to http://localhost:${port}`);
});

export default server;




