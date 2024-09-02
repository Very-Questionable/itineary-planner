import Day from "../Activities/Day";
import Hotel from "../Hotel/Hotel";
import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";
import TripSegment from "./TripSegment";

export default class Trip extends TripInfo {
  splits: Array<TripSegment>;

  constructor(
    id: string,
    info: string,
    start: Date,
    end: Date,
    travellers?: Array<Person>,
    splits?: Array<TripSegment>,
    metadata?: object
  ) {
    super(id, info, start, end, travellers, metadata);
    this.splits = splits ? splits! : [];
  }

  /**
   * add split: Adds a trip segment to a split
   * Split cannot be before trip start, split cannot be after trip start
   * Splits CAN overlap, but will not be wellformed
   * @param split
   */
  public addSplit(split: TripSegment) {
    if (this.containsSplit(split.id)) throw new Error("Split id in use");
    if (split.start < this.start)
      throw new Error("Split start before trip start");
    if (split.end > this.end) throw new Error("Split end after trip end");
    if (this.isOverlapping(split))
      throw new Error("Split overlaps with other splits");
    this.splits.push(split);
    this.splits.sort((a, b) =>
      a.start.getTime() !== b.start.getTime()
        ? a.start.getTime() - b.start.getTime()
        : a.end.getTime() - b.end.getTime()
    );
  }

  /**
   * Checks if a split is overlapping with the rest of the splits beyond allowed leyway
   * @param split
   * @returns
   */
  private isOverlapping(split: TripSegment): boolean {
    return this.splits.some(
      (s) =>
        s.end.getTime() > split.start.getTime() &&
        split.end.getTime() > s.start.getTime()
    );
  }

  public removeSplit(id: string): TripSegment {
    const target = this.getSplit(id);
    if (!target) throw new Error("not implemented");
    return target;
  }

  public containsSplit(id: string): boolean {
    return this.splits.some((s) => s.id === id);
  }

  public getSplit(id: string): TripSegment | undefined {
    return this.splits.find((s) => s.id === id);
  }

  // Hotel logic
  public addHotel(splitId: string, hotel: Hotel) {
    const target = this.getSplit(splitId);
    if (!target) throw new Error("Split not found");
    target.addHotel(hotel);
  }

  public removeHotel(splitId: string, hotelId: string): Hotel {
    const target = this.getSplit(splitId);
    if (!target) throw new Error("Split not found");
    return target.removeHotel(hotelId);
  }

  public listHotels(): Array<Hotel> {
    return this.splits.flatMap((split) => split.hotels);
  }

  // Itineary logic
  public addDay(splitId: string, day: Day): void {
    const target = this.getSplit(splitId);
    if (!target) throw new Error("Split not found");
    return target.addDay(day);
  }

  public removeDay(splitId: string, dayId: string): Day {
    const target = this.getSplit(splitId);
    if (!target) throw new Error("Split not found");
    return target.removeDay(dayId);
  }

  public containsDay(dayId: string): boolean {
    return this.listDays().some((d) => d.id === dayId);
  }

  public getDay(dayId: string): Day | undefined {
    return this.listDays().find((d) => d.id === dayId);
  }
  public listDays(): Array<Day> {
    return this.splits
      .flatMap((s) => s.days)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * wellformed: A trip is wellformed, iff
   *  - All of the sub segments are wellformed
   *  - The subsegments account for the same of travellers as the trip
   *  - start and end dates align with the start and end dates of the splits
   */
  wellformed(): boolean {
    const wellformedSplits = this.splits.every(s => s.wellformed());
    const areDaysSequential = this.listDays().map((day) =>
      Math.abs(day.date.getTime() / (1000 * 60 * 60 * 24))
    );
    const sequentialCond = areDaysSequential
      .map((t) => t - areDaysSequential[0])
      .every((v, i) => v === i);
    const durationCond = this.listDays().length === this.duration();
    const travellerCond = this.splits.every(s => s.travellers.sort() === this.travellers.sort());
    return wellformedSplits && sequentialCond && durationCond && travellerCond;
  }
}
