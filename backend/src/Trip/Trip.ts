import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";
import TripSegment from "./TripSegment";

export default class Trip extends TripInfo {
    splits: Array<TripSegment>
    constructor(id: string, info: string, start: Date, end: Date, travellers?: Array<Person>, splits?: Array<TripSegment>) {
        super(id,info,start,end, travellers);
        this.splits = splits ? splits! : [];
    }

    /**
     * wellformed: A trip is wellformed, iff
     *  - All of the sub segments are wellformed
     *  - The subsegments account for the same of travellers as the trip
     *  - start and end dates align with the start and end dates of the splits
     */
    wellformed(): boolean {
        throw new Error("Method not implemented.");
    }
}