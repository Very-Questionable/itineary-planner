import Info from "../Info.js";

export default abstract class HotelInfo extends Info {
    checkIn: Date
    checkOut: Date

    constructor(id: string, info: string, checkIn: Date, checkOut: Date, metadata?: object) {
        super(id,info,metadata);
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }

    /**
     * returns duration of stay in nights
     */
    public duration(): number {
        return Math.floor(Math.abs(this.checkOut.getTime() - this.checkIn.getTime())/(1000 * 60 * 60 *24))
    }
}