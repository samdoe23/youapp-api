import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { Room, RoomSchema } from "src/chat/room.schema";
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
