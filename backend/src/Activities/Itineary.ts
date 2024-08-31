import Info from "../Info";
import Activity from "./Activity";

// export type Itineary = SplitDayItineary | WholeDayItineary | FreeDayItineary;

export default abstract class Itineary extends Info {
  images: Array<string>;
  name: string
  constructor (id:string, info: string, name:string, images?: Array<string>) {
    super(id,info)
    this.name = name;
    this.images = images ? images : [];
  }

  abstract listActivities() : Array<Activity>;
  abstract isFreeDay() : boolean;
}



