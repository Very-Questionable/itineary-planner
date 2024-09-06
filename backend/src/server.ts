import express, {Request, Response} from 'express';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import swaggerDoc from '../swagger.json' 
import { InputError, AccessError } from './Error/error.js';
import { getTrips, handleCreateNewHotel, handleCreateNewSplit, handleCreateNewTrip, handleDeleteHotel, handleDeleteSplit, handleDeleteTrip, handleGetHotel, handleGetHotels, handleGetSplit, handleGetSplits, handleGetTrip, handleUpdateHotel, handleUpdateSplit, handleUpdateTrip, reset, save } from './data.js';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(morgan(':method :url :status'));


const catchErrors = (fn: CallableFunction) => async (req: Request, res: Response) => {
  try {
    console.log(`Authorization header is ${req.header('Authorization')}`);
    if (req.method === 'GET') {
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
      res.status(500).send({ error: 'A system error ocurred' });
    }
  }
};

/**
 * User
 */


/******************************************
 * Get Trips
 ******************************************/
app.get('/trips', catchErrors(async (req:Request, res:Response) => {
  return res.status(200).json({ trips: getTrips() })
}));

app.post('/trips/new', catchErrors(async (req:Request, res:Response) => {
  const {info, start, end, metadata} = req.body;
  const newTrip = await handleCreateNewTrip(info,start,end,metadata);
  return res.status(200).json({ tripId: newTrip });
}));

app.get('/trips/:tripId', catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params
  const trip = handleGetTrip(tripId)
  return res.status(200).json({trip: trip, wellformed: trip.wellformed() });
}));

app.put('/trips/update/:tripId', catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  const {info, start, end, travellers, splits, metadata} = req.body;

  const wellformed = await handleUpdateTrip(tripId,info,start,end,travellers,splits,metadata);
  return res.status(200).json({ wellformed: wellformed });
}));

app.delete('/trips/remove/:tripId', catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  await handleDeleteTrip(tripId);
  return res.status(200).json({});
}));



/**
|/splits/{tripId}                               |Lists all splits in a trip|GET    |
|/splits/new/{tripId}                           |Creates a new split in a  |POST   |
|/splits/get/{tripId}/{splitId}                 |Gets specific split in a  |GET    |
|/splits/update/{tripId}/{splitId}              |Updates a specific split  |PUT    |
|/splits/remove/{tripId}/{splitId}              |Removes a specific split  |DELETE |
*/
app.post('/splits/new/:tripId', catchErrors(async (req:Request, res:Response) => {
  const { tripId } = req.params;
  const {info, start, end} = req.body;
  const splitId = await handleCreateNewSplit(tripId, info, start, end);
  return res.status(200).json({splitId: splitId});
}));

app.get('/splits/:tripId', catchErrors(async (req:Request, res:Response) => {
  const {tripId} = req.params;
  const splits = handleGetSplits(tripId);
  return res.status(200).json({splits: splits});
}));

app.get('/splits/:tripId/:splitId', catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId} = req.params;
  const split = handleGetSplit(tripId, splitId);
  return res.status(200).json({split: split, wellformed: split.wellformed()});
}));

app.put('/splits/update/:tripId/:splitId', catchErrors(async (req:Request, res:Response) => {
  const { tripId, splitId } = req.params;
  const {info, start, end, hotels, days} = req.body;
  await handleUpdateSplit(tripId,splitId, info, start, end, hotels, days);
  return res.status(200).json({});
}));

app.delete('/splits/remove/:tripId/:splitId', catchErrors(async (req:Request, res:Response) => {
  const {tripId, splitId} = req.params;
  await handleDeleteSplit(tripId, splitId);
  return res.status(200).json({});
}));


/**
 * Utils
 */
app.delete('/clear', catchErrors(async (req:Request, res:Response) => {
  await reset();
  return res.status(200).json({});
}))


/**
 *
 * |/hotel/{tripId}/{splitId}                      |Lists all hotels          |GET    |
 * |/hotel/{tripId}/{splitId}                      |Lists all hotels          |POST    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Gets specific hotel       |GET    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Update hotel              |PUT    |
 * |/hotel/{tripId}/{splitId}/{hotelId}            |Removes Hotel             |DELETE |
 * 
*/
app.post("/hotels/new/:tripId/:splitId", catchErrors (async (req:Request, res:Response) => {
  const { tripId, splitId } = req.params;
  const { info, checkIn, checkOut, location } = req.body;
  const hotelId = await handleCreateNewHotel(tripId,splitId,info,checkIn,checkOut,location);
  return res.status(200).json({ hotelId: hotelId});
}));

app.get("/hotels/:tripId/:splitId", catchErrors (async (req:Request, res:Response) => {
  const { tripId, splitId } = req.params;
  const hotels = await handleGetHotels(tripId,splitId);
  return res.status(200).json({ hotels: hotels })
}));

app.get("/hotels/:tripId/:splitId/:hotelId", catchErrors (async (req:Request, res:Response) => {
  const { tripId, splitId, hotelId } = req.params;
  const hotel = await handleGetHotel(tripId,splitId, hotelId);
  return res.status(200).json({ hotel: hotel, wellformed: hotel.wellformed() })

}));

app.put("/hotels/update/:tripId/:splitId/:hotelId", catchErrors (async (req:Request, res:Response) => {
  const { tripId, splitId, hotelId } = req.params;
  const { info, checkIn, checkOut, location, rooms, metadata } = req.body;
  const wellformed = await handleUpdateHotel(tripId,splitId, hotelId, info, checkIn, checkOut, location, rooms, metadata);
  return res.status(200).json({wellformed: wellformed})
}));

app.delete("/hotels/remove/:tripId/:splitId/:hotelId", catchErrors (async (req:Request, res:Response) => {
  const { tripId, splitId, hotelId } = req.params;
  await handleDeleteHotel(tripId,splitId, hotelId);
  return res.status(200).json({})

}));


/****************************************
 * Run Server
*****************************************/

app.get('/', (_req, res) => res.redirect('/docs'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const port = 5033;

const server = app.listen(port, () => {
  console.log(`Backend is now listening on port ${port}!`);
  console.log(`For API docs, navigate to http://localhost:${port}`);
});

export default server;

