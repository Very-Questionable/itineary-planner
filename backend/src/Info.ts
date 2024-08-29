export default abstract class Info {
    id: string
    info: string

    constructor (id:string, info:string) {
        this.id = id;
        this.info = info;
    }

    abstract wellformed() : boolean
}