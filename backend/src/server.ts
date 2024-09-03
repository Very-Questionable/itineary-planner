import express, {Request, Response} from 'express';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import swaggerDoc from '../swagger.json' with { type: 'json' }
import { InputError, AccessError } from './Error/error.js';
import Trip from './Trip/Trip.js';
import { randomUUID } from 'crypto';
import { save } from './data.js';

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
    save();
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
app.get('/trips', (req, res) => {});

app.post('/trip', (req, res) => {
  const {info, start, end} = req.body;
  const newTrip = new Trip(`trip${start}${randomUUID()}`,info, start, end); 
  return res.status(200).json({ trips: newTrip});
});

app.get('/trip', (req, res) => {});
app.get('/trip', (req, res) => {});

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
