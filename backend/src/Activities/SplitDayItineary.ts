import Activity, { Activities } from "./Activity";
import Itineary from "./Itineary";

export default class SplitDayItineary extends Itineary {
  private afternoon: Array<Activity>;
  private morning: Array<Activity>;
  private night: Array<Activity>;
  
  constructor (id: string, info: string, name: string, activities: Activities ,images?: Array<string>,
  ) {
    super(id,info,name,images)
    this.morning = activities.morning ? activities.morning : [];
    this.afternoon = activities.afternoon ? activities.afternoon : [];
    this.night = activities.night ? activities.night : [];
  }

  isFreeDay(): boolean {
    return false;
  }

  listActivities(): Array<Activity> {
    return this.morning.concat(this.afternoon).concat(this.night)
  }

  wellformed(): boolean {
    return this.morning.concat(this.afternoon).concat(this.night).length > 0;
  }
}