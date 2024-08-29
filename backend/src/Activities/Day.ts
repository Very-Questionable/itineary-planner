import Info from "../Info";

export default abstract class Day extends Info {
    abstract wellformed(): boolean
    
    date: Date
    
    constructor (id: string, info: string, date:Date) {
        super(id, info);
        this.date = date;
    }

}