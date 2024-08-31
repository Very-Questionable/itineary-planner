import Activity, { Activities } from "../src/Activities/Activity"
import Day from "../src/Activities/Day"
import FreeDayItineary from "../src/Activities/FreeDayItineary"
import SplitDayItineary from "../src/Activities/SplitDayItineary"
import WholeDayItineary from "../src/Activities/WholeDayItineary"


const myActivity: Activity = {
  id:"1",name:"nabewari",info:"udon",location:"nabewari"
}
const myActivity2: Activity = {
  id:"2",name:"deer",info:"shikanokonokonokokoshitantan",location:"nara"
}

const myActivity3: Activity = {
  id:"3",name:"deer",info:"shikanokonokonokokoshitantan",location:"nara"
}
const myActivity4: Activity = {
  id:"4",name:"deer",info:"shikanokonokonokokoshitantan",location:"nara"
}
const myActivities: Activities = {
  morning: [myActivity],
  afternoon: [myActivity2, myActivity3, myActivity4]
}

const myFreeItineary = new FreeDayItineary("1","Free day", "free day");
const mySplitItineary = new SplitDayItineary("2","Split day", "Split day",myActivities);
const myWholeItineary = new WholeDayItineary("3", "Whole day", "whole day", myActivity)
describe("Day tests", () => {
  test("Compiles",() => {
    // const validBooked = new Hotel("1","myRoom", new Date(Date.parse("2019-01-01")), new Date(Date.parse("2019-01-04")),"Here",[singleRoom, singleRoom3]);
    const myDay = new Day("1","1",new Date(Date.parse("2019-01-01")))
    expect(myDay).toBeDefined();
  });

  test("Add itineary",() => {
    const myDay = new Day("1","1",new Date(Date.parse("2019-01-01")))
    myDay.addItineary(myFreeItineary);
    
    expect(() => myDay.addItineary(myFreeItineary)).toThrow();
    
    myDay.addItineary(mySplitItineary);
    myDay.addItineary(myWholeItineary);

    expect(myDay.itinearies).toContain(myWholeItineary);
    expect(myDay.itinearies).toContain(mySplitItineary);
    expect(myDay.itinearies).toContain(myFreeItineary);

  });

  test("Remove Itineary",() => {
    const myDay = new Day("1","1",new Date(Date.parse("2019-01-01")))
    myDay.addItineary(myFreeItineary);
    myDay.addItineary(mySplitItineary);
    myDay.addItineary(myWholeItineary);
    
    expect(() => myDay.removeItineary("0")).toThrow();

    expect(myDay.removeItineary(mySplitItineary.id)).toStrictEqual(mySplitItineary);  
    expect(myDay.removeItineary(myFreeItineary.id)).toStrictEqual(myFreeItineary);  
    expect(myDay.removeItineary(myWholeItineary.id)).toStrictEqual(myWholeItineary);  
  
  });


  test("Wellformed",() => {
    expect(myFreeItineary.wellformed()).toBeTruthy();
    expect(mySplitItineary.wellformed()).toBeTruthy();
    expect(myWholeItineary.wellformed()).toBeTruthy();
    const myDay = new Day("1","1",new Date(Date.parse("2019-01-01")))
    expect(myDay.wellformed()).toBeFalsy();
    myDay.addItineary(myFreeItineary);
    expect(myDay.wellformed()).toBeTruthy();
    myDay.addItineary(mySplitItineary);
    expect(myDay.wellformed()).toBeTruthy();
    myDay.addItineary(myWholeItineary);
    expect(myDay.wellformed()).toBeFalsy();
    
  })


})