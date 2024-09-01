import Activity from "./Activity";
import Itineary from "./Itineary";

export default class WholeDayItineary extends Itineary {
  private activity: Activity;

  constructor(id: string, info: string, name: string, activity: Activity, images?: Array<string>) {
    super(id, info, name, images)
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