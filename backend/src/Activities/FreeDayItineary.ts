import Activity from "./Activity";
import Itineary from "./Itineary";

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
