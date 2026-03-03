import { UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Model, Types } from "mongoose";
import { Server, Socket } from "socket.io";
import { Room } from "src/chat/room.schema";
import { WsJwtGuard } from "src/jwt/jwt.guard";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @InjectModel(Room.name)
  roomModel: Model<Room>;

  chatroom = (room: Types.ObjectId) => `chat-${room}`;

  sendMessage(message: string, room: Types.ObjectId, by: Types.ObjectId) {
    this.server.to(this.chatroom(room)).emit("messages", { by, message });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("messages")
  async subscribeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { from: Types.ObjectId },
  ) {
    const participants = [
      new Types.ObjectId(payload.from),
      new Types.ObjectId(client.data.user.sub),
    ];

    const roomDoc = await this.roomModel.findOneAndUpdate(
      {
        participants: {
          $in: participants,
          $size: 2,
        },
      },
      { participants },
      { upsert: true, returnDocument: "after" },
    );

    await client.join(this.chatroom(roomDoc._id));

    return true;
  }
}
