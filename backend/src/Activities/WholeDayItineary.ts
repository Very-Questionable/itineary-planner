import Activity from "./Activity.js";
import Itineary from "./Itineary.js";

export default class WholeDayItineary extends Itineary {
  private activity: Activity;

  constructor(id: string, info: string, activity: Activity, metadata?:object) {
    super(id, info, metadata);
    this.activity = activity;
  }

  isFreeDay(): boolean {
    return false;
  }

  listActivities(): Array<Activity> {
    return [this.activity];
  }

  wellformed(): boolean {
    return true;
  }
}