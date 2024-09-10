import { randomUUID } from "crypto";

export default abstract class Info {
    static generateId(): string {
        return randomUUID();
    }

    private info: string
    private metadata?: object | undefined
    id: string
    constructor (id:string, info:string, data?: object) {
        this.id = id;
        this.info = info;
        this.metadata = data;
    }

  updateInfo(info?: string, metadata?: object) {
    if (info) this.info = info;
    if (metadata) this.metadata = metadata;
  }

    abstract wellformed() : boolean
}

