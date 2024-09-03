import Info from "../Info";
import Activity from "./Activity";

// export type Itineary = SplitDayItineary | WholeDayItineary | FreeDayItineary;

export default abstract class Itineary extends Info {
  constructor (id:string, info: string, metadata?: object) {
    super(id,info, metadata)
  }

  abstract isFreeDay() : boolean;
  abstract listActivities() : Array<Activity>;
}



