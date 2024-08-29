import {Activity} from "./Activity";
import Day from "./Day";

export default class DayTrip extends Day {
  activity: Activity
  location: string

  constructor (id: string, info: string, date:Date, location: string, activity:Activity) {
    super(id, info, date);
    this.activity = activity;
    this.location = location;
  }

  wellformed(): boolean {
    return true;
  }
}