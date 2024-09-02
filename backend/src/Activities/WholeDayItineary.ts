import Activity from "./Activity";
import Itineary from "./Itineary";

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