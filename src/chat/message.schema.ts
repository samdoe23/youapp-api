import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
