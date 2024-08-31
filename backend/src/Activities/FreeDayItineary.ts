import Activity from "./Activity";
import Itineary from "./Itineary";

export default class FreeDayItineary extends Itineary {
  constructor(id: string, info: string, name: string, images?: Array<string>) {
    super(id, info, name, images);
  }

  listActivities(): Array<Activity> {
    return [];
  }
  isFreeDay(): boolean {
    return true;
  }
  wellformed(): boolean {
    return true;
  }
}
