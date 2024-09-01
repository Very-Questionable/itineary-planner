export default abstract class Info {
    private info: string
    id: string
    constructor (id:string, info:string) {
        this.id = id;
        this.info = info;
    }

    abstract wellformed() : boolean
}