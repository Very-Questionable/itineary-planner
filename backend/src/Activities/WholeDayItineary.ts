import Activity from "./Activity";
import Itineary from "./Itineary";

export default class WholeDayItineary extends Itineary {
  activity: Activity;

  constructor(id: string, info: string, name: string, activity: Activity, images?: Array<string>) {
    super(id, info, name, images)
    this.activity = activity;
  }

  listActivities(): Array<Activity> {
    return [this.activity];
  }
  isFreeDay(): boolean {
    return false;
  }
  wellformed(): boolean {
    return true;
  }
}