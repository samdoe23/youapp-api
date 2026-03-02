import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

class Message {
  by: Types.ObjectId;
  content: string;
}

@Schema()
export class Room {
  @Prop()
  participants: Types.ObjectId[];

  @Prop()
  messages: Message[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
