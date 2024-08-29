import Day from "./Day"
import {Activity} from "./Activity"
export default class FreeDay extends Day {
  activity: Activity
 
  constructor (id: string, info: string, date: Date, activity: Activity) {
    super(id, info, date)
    this.activity = activity;
  }

  wellformed(): boolean {
    return true;
  }
}