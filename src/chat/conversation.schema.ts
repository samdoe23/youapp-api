import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  participants: Types.ObjectId[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
