export interface Activity {
  name: string,
  info: string,
  images: Array<string>,
}

export interface Activities {
  morning?: Array<Activity>
  afternoon?: Array<Activity>
  night?: Array<Activity>
}