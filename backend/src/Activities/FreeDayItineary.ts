import Activity from "./Activity.js";
import Itineary from "./Itineary.js";

export default class FreeDayItineary extends Itineary {
  constructor(id: string, info: string, metadata?: object) {
    super(id, info, metadata);
  }

  isFreeDay(): boolean {
    return true;
  }

  listActivities(): Array<Activity> {
    return [];
  }

  wellformed(): boolean {
    return true;
  }
}
