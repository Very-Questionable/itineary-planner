import {Activities} from "./Activity";
import Day from "./Day";

export default class SplitDay extends Day {
  
  activities: Activities 
  constructor (id: string, info: string, date:Date, activities: Activities) {
    super(id, info, date);
    this.activities = activities;
  }
  
  wellformed(): boolean {
    return Object.keys(this.activities).length !== 0
  }
}

