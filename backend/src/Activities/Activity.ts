/**
 * Each Itineary has an Itineary ID
 * Each Activity has an Activity ID
 */

export default interface Activity {
  id: string
  name: string,
  info: string,
  location: string,
  images?: Array<string>,
  metadata?: object
}
/**
 * Payload for activities
 */
export interface Activities {
  morning?: Array<Activity>;
  afternoon?: Array<Activity>;
  night?: Array<Activity>;
  metadata?: object
}

