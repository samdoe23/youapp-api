import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export class Message {
  by: Types.ObjectId;
  content: string;
  timestamp: Date;

  constructor({ by, content, timestamp = new Date() }) {
    this.by = by;
    this.content = content;
    this.timestamp = timestamp;
  }
}

@Schema()
export class Room {
  @Prop()
  participants: Types.ObjectId[];

  @Prop({ type: Array(Message) })
  messages: Message[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
