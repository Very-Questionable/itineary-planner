export default interface User {
  id: string
  name: string
  password?: string | undefined
  createdTrips: Array<string>
}