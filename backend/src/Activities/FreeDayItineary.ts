import Activity from "./Activity";
import Itineary from "./Itineary";

export default class FreeDayItineary extends Itineary {
  constructor(id: string, info: string, name: string, images?: Array<string>) {
    super(id, info, name, images);
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
