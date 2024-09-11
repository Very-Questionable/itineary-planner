import { AccessError } from "../Error/error.js";
import Info from "../Info.js";
import { ItinearyMap } from "../Server/interfaces.js";
import Activity from "./Activity.js";
import Itineary from "./Itineary.js";
export default class Day extends Info {
  
  date: Date;
  itinearies: ItinearyMap = {};
  constructor(
    id: string,
    info: string,
    date: Date,
    itinearies?: Array<Itineary>,
    metadata?: object
  ) {
    super(id, info, metadata);
    this.date = date;
    itinearies?.forEach(it => this.addItineary(it));
  }

  public addItineary(itineary: Itineary) {
    if (this.containsItineary(itineary.id))
      throw new AccessError("Itineary already added");
    this.itinearies[itineary.id] = itineary;
  }

  public containsActivity(id: string): boolean {
    return Object.values(this.itinearies).flatMap(it => it.listActivities()).some(act => act.id === id);
  }

  public containsItineary(id: string): boolean {
    return id in this.itinearies; 
  }

  public generateItinearyId(): string {
    let genId = "Itineary" + Info.generateId();
    while(this.containsItineary(genId)) genId = "Itineary" + Info.generateId();
    return genId;
  }

  public getActivity(id: string): Activity|undefined {
    return Object.values(this.itinearies).flatMap(it => it.listActivities()).find(act => act.id === id);
  }

  public getItineary(id: string): Itineary | undefined {
    return this.itinearies[id]; 
  }

  public removeItineary(id: string): Itineary {
    const target = this.getItineary(id); 
    if (!target) throw new AccessError("Itineary Does not exist");
    delete this.itinearies[id];
    return target;
  }

  wellformed(): boolean {
    const allActivities = Object.values(this.itinearies).flatMap(it => it.listActivities());
    const nubbedActivities = new Set(allActivities);
    return (
      nubbedActivities.size === allActivities.length && 
      Object.values(this.itinearies).length > 0 &&
      Object.values(this.itinearies).every((it) => it.wellformed())
    );
  }
}
