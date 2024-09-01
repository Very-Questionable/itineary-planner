import Info from "../Info";
import Itineary from "./Itineary";
export default class Day extends Info {
  date: Date;
  itinearies: Array<Itineary>;
  constructor(
    id: string,
    info: string,
    date: Date,
    itinearies?: Array<Itineary>
  ) {
    super(id, info);
    this.date = date;
    this.itinearies = itinearies ? itinearies : [];
  }

  public addItineary(itineary: Itineary) {
    if (this.containsItineary(itineary.id))
      throw new Error("Itineary already added");
    this.itinearies.push(itineary);
  }

  public containsItineary(id: string): boolean {
    return this.itinearies.some((itineary) => itineary.id === id);
  }

  public removeItineary(id: string): Itineary {
    const target = this.itinearies.find((it) => it.id === id);
    if (!target) throw new Error("Itineary Does not exist");
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
