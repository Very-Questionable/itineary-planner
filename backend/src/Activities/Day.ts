import { AccessError } from "../Error/error.js";
import Info from "../Info.js";
import Activity from "./Activity.js";
import Itineary from "./Itineary.js";
export default class Day extends Info {
  
  date: Date;
  itinearies: Array<Itineary>;
  constructor(
    id: string,
    info: string,
    date: Date,
    itinearies?: Array<Itineary>,
    metadata?: object
  ) {
    super(id, info, metadata);
    this.date = date;
    this.itinearies = itinearies ? itinearies : [];
  }

  public addItineary(itineary: Itineary) {
    if (this.containsItineary(itineary.id))
      throw new AccessError("Itineary already added");
    this.itinearies.push(itineary);
  }
  
  public generateItinearyId(): string {
    let genId = "Itineary" + Info.generateId();
    while(this.containsItineary(genId)) genId = "Itineary" + Info.generateId();
    return genId;
  }

  public generateActivityId(): string {
    let genId = "Activity" + Info.generateId();
    while(this.containsItineary(genId)) genId = "Activity" + Info.generateId();
    return genId;

  }

  public containsActivity(id: string): boolean {
    return this.itinearies.flatMap(it => it.listActivities()).some(act => act.id === id);
  }
  
  public getActivity(id: string): Activity|undefined {
    return this.itinearies.flatMap(it => it.listActivities()).find(act => act.id === id);
  }

  public getItineary(id: string): Itineary | undefined {
    return this.itinearies.find(it => it.id === id);
  }

  public containsItineary(id: string): boolean {
    return this.itinearies.some((itineary) => itineary.id === id);
  }

  public removeItineary(id: string): Itineary {
    const target = this.itinearies.find((it) => it.id === id);
    if (!target) throw new AccessError("Itineary Does not exist");
    this.itinearies = this.itinearies.filter((it) => it.id !== id);
    return target;
  }

  wellformed(): boolean {
    const allActivities = this.itinearies.flatMap(it => it.listActivities());
    const nubbedActivities = new Set(allActivities);
    return (
      nubbedActivities.size === allActivities.length && 
      this.itinearies.length > 0 &&
      this.itinearies.every((it) => it.wellformed())
    );
  }
}
