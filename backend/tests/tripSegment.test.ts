import TripSegment from "../src/Trip/TripSegment";

describe("TripSegment Hotel Integration", () => {
  test("compiles", () => {
    const startDate = new Date(Date.parse("2019-01-01"))
    const endDate = new Date(Date.parse("2019-01-04"));
    const temp = new TripSegment("t","t", startDate,endDate)
    expect(temp).toBeDefined();
    
  })
  
  test("Wellformed", () => {

  });
});


describe("TripSegment Activities Integration", () => {
  test("Wellformed", () => {

  });
});