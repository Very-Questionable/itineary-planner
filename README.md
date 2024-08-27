# Itineary Planner

This should provide the tools to plan out an Itneary

```mermaid
---
title : Itineary Interface
---
classDiagram

    Trip *-- TripSegments :1..many
    TripSegments *-- Day  :1..many
    TripSegments o-- Hotel :1..1
    PartialDay *-- Activity :1..3
    DayTrip *-- Activity :1..1

    FreeDay <|-- Day
    PartialDay <|-- Day
    DayTrip <|-- Day

    Transport <|-- Train
    Transport <|-- Flight
    Flight <|-- ArrivalFlight
    Flight <|-- DepartureFlight


    class Trip {
        +String overview
        +Time start
        +Time end
        +List~TripSegments~ splits

        +Double calcCostPP()

    }

    class TripSegments {
        +Hotel hotel
        +String Location
        +String Name
        +String Info
        +List~Day~ days
    }

    class Day {
        +String city
    }

    class DayTrip {
        +Activity activity
        +Transport to
        +Transport from
    }
    
    class PartialDay {
        +List~Activity~ activities
        +Bool ClashingActivities()
    }

    class FreeDay {
        +Bool isTransit
    }

    class Activity {
        +Enum Morning|Afternoon|Night
        +String Name
        +String Info
    }

    class Hotel {
        +Time CheckIn
        +Time CheckOut
        +Int Duration
        +String Location
        +String Name
        +Double Price
        +Int Travellers
        +List~Person~ people

        +Double PricePerDay()
        +Double PricePerPerson()
        +Double PricePerPersonPerDay()
        +Void AddPerson(Person)
    }

    class Transport {
        String Info
    }

    class Train {
        +String Station
        +Time Arrival
        +Time Departure
    }

    class Flight {
        +String Airport
    }

    class ArrivalFlight {
        +Time ArrivalTime
    }

    class DepartureFlight {
        +Time DepartureTime        
    }
    Hotel o-- Person : 1..many
    class Person {
        +String Name
        +Bool prefSingle
        +Bool requireSingle
    }
```


```mermaid
---
    title: Planner Interface
---
classDiagram
    class SplitOverview {
        +String city
        +List~Hotel~ hotels
        +JSON JSONify()
        +FilePath toCSV()
        +String fromCSV(FilePath)
    }

    class PlannerOverview {
        +Int people
        +List~Trip~ Itinearies
        +JSON JSONify()
        +FilePath toCSV()
        +String fromCSV(FilePath)
    }

```

## TODO

Back end
- [ ] Hotels
- [ ] Activities
- [ ] Transport
- [ ] Overviews
Front end
- [ ] Homepage
- [ ] Hotels UI
- [ ] Activities UI
- [ ] Transport UI
- [ ] Overview
