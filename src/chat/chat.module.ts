import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Conversation, ConversationSchema } from "./conversation.schema";
import { Message, MessageSchema } from "./message.schema";
import { JwtStrategy } from "src/jwt/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, JwtStrategy],
})
export class ChatModule {}
