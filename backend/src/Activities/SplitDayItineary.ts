import Activity, { Activities } from "./Activity.js";
import Itineary from "./Itineary.js";

export default class SplitDayItineary extends Itineary {
  private afternoon: Array<Activity>;
  private morning: Array<Activity>;
  private night: Array<Activity>;

  constructor(
    id: string,
    info: string,
    activities: Activities,
    metadata?: object
  ) {
    super(id, info, metadata);
    this.morning = activities.morning ? activities.morning : [];
    this.afternoon = activities.afternoon ? activities.afternoon : [];
    this.night = activities.night ? activities.night : [];
  }

  public updateActivities(activities?: Activities) {
    if (!activities) return;
    this.morning = activities.morning ? activities.morning : this.morning;
    this.afternoon = activities.afternoon ? activities.afternoon : this.afternoon;
    this.night = activities.night ? activities.night : this.night;
  }
  
  isFreeDay(): boolean {
    return false;
  }

  listActivities(): Array<Activity> {
    return this.morning.concat(this.afternoon).concat(this.night);
  }

  wellformed(): boolean {
    return this.morning.concat(this.afternoon).concat(this.night).length > 0;
  }
}
