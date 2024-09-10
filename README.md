# Itineary Planner

This should provide the tools to plan out an Itneary
## UML of backend
![UML of backend](./images/src_diagram.png)
![UML of server](./images/backend_server_diagram.png)

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
## Routes

|path                                           |description               |method |
|-                                              |-                         |-------|
|/trips                                         |lists a user's trips      |GET    |
|/trips/new                                     |Creates empty trip        |POST   |
|/trips/{tripId}                                |Gets a spacific trip      |GET    |
|/trips/update/{tripId}                         |Updates a specific trip   |PUT    |
|/trips/remove/{tripId}                         |Deletes a specific trip   |PUT    |
|/splits/{tripId}                               |Lists all splits in a trip|GET    |
|/splits/{tripId}/{splitId}                 |Gets specific split in a  |GET    |
|/splits/new/{tripId}                           |Creates a new split in a  |POST   |
|/splits/update/{tripId}/{splitId}              |Updates a specific split  |PUT    |
|/splits/remove/{tripId}/{splitId}              |Removes a specific split  |DELETE |
|/hotels/{tripId}/{splitId}                     |Lists all hotels          |GET    |
|/hotels/{tripId}/{splitId}/{hotelId}           |Gets specific hotel       |GET    |
|/hotels/new/{tripId}/{splitId}                 |Adds a hotel              |GET    |
|/hotels/update/{tripId}/{splitId}/{hotelId}    |Update hotel              |PUT    |
|/hotels/remove/{tripId}/{splitId}/{hotelId}    |Removes Hotel             |DELETE |
|/rooms/{tripId}/{splitId}/{hotelId}             |Lists Rooms for a hotel   |GET    |
|/rooms/{tripId}/{splitId}/{hotelId}/{roomId}    |Gets specific room        |GET    |
|/rooms/new/{tripId}/{splitId}/{hotelId}             |Adds a Room for a hotel   |POST     |
|/rooms/update/{tripId}/{splitId}/{hotelId}/{roomId}    |updates specific room     |PUT    |
|/rooms/remove{tripId}/{splitId}/{hotelId}/{roomId}    |removes specific room     |DELETE |
|/rooms/{tripId}/{splitId}/{hotelId}/{roomId}/assign/{traveller}    |Adds traveller to room     |POST |
|/rooms/{tripId}/{splitId}/{hotelId}/{roomId}/unassign/{traveller}    |removes traveller from room     |DELETE |
|/days/{tripId}                                  |lists days                |GET    |
|/days/{tripId}/{splitId}                        |list days in a split      |GET    |
|/days/new/{tripId}/{splitId}                        |add a day to a split      |POST   |
|/days/update/{tripId}/{splitId}/{dayId}                |Update a day              |PUT    |
|/days/remove/{tripId}/{splitId}/{dayId}                |Removes a day             |DELETE |
|/itinearies/{tripId}/{splitId}/{dayId}           |Lists activities          |GET    |
|/itinearies/{tripId}/{splitId}/{dayId}/{itinearyId}           |Specific activity Details          |GET    |
|/itinearies/new/{tripId}/{splitId}/{dayId}           |Post an activity          |POST   |
|/itinearies/update/{tripId}/{splitId}/{dayId}/{itinearyId} |updates an activity    |PUT    |
|/itinearies/remove/{tripId}/{splitId}/{dayId}/{itinearyId} |deletes an activity    |DELETE |




## TODO

Back end
- [x] Hotels
- [x] Activities
- [x] Transport
- [x] Overviews
- [x] Server interface
- [ ] Refactor to use hashmap
Front end
- [ ] Homepage
- [ ] Hotels UI
- [ ] Activities UI
- [ ] Transport UI
- [ ] Overview
