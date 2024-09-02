export default abstract class Info {
    info: string
    id: string
    metadata?: object
    constructor (id:string, info:string, data?: object) {
        this.id = id;
        this.info = info;
        this.metadata = data;
    }

    abstract wellformed() : boolean
}