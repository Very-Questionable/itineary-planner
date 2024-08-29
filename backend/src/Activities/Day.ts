import Info from "../Info";

export default class Day extends Info {
    wellformed(): boolean {
        throw new Error("Method not implemented.");
    }
    
    constructor (id: string, info: string) {
        super(id, info);
    }
}