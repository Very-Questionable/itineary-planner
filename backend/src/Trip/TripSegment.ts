import Day from "../Activities/Day";
import Hotel from "../Hotel/Hotel";
import Person from "../Hotel/Person";
import TripInfo from "./TripInfo";

export default class TripSegment extends TripInfo {
    wellformed(): boolean {
        throw new Error("Method not implemented.");
    }

    hotels: Array<Hotel>;
    days: Array<Day>;

    constructor(id: string, info: string, start: Date, end: Date, 
        travellers?: Array<Person>,
        hotels?: Array<Hotel>,
        days?: Array<Day>
        ) {
        super(id,info,start,end, travellers);
        this.hotels = hotels ? hotels! : [];
        this.days = days ? days! : [];
        
    }

}