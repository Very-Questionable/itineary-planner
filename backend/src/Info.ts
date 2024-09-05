import { randomUUID } from "crypto";

export default abstract class Info {
    info: string
    id: string
    metadata?: object | undefined
    constructor (id:string, info:string, data?: object) {
        this.id = id;
        this.info = info;
        this.metadata = data;
    }

    abstract wellformed() : boolean

    static generateId(): string {
        return randomUUID();
    }
  updateInfo(info?: string, metadata?: object) {
    if (info) this.info = info;
    if (metadata) this.metadata = metadata;
  }

}

