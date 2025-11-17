import { Types } from 'mongoose';

export interface RoomNameAvailabilityQuery {
  name: string;
  _id?: { $ne: Types.ObjectId };
}
