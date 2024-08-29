import Person from "../Hotel/Person";
import Info from "../Info";

export default abstract class TripInfo extends Info {
    start: Date;
    end: Date;
    travellers: Array<Person>
    constructor(id: string, info: string, start: Date, end: Date, travelers?: Array<Person>) {
        if (start > end) throw new Error("Start date after end Date");
        super(id, info);
        this.start = start;
        this.end = end;
        this.travellers = travelers ? travelers! : [];
    }
}
