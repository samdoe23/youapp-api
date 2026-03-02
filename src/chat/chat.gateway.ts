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

  sendMessage(message: string, room: Types.ObjectId, by: Types.ObjectId) {
    this.server.to(room.toString()).emit("messages", { by, message });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("messages")
  async subscribeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { from: Types.ObjectId },
  ) {
    const roomDoc = await this.roomModel.findOne(
      {
        participants: {
          $in: [
            new Types.ObjectId(payload.from),
            new Types.ObjectId(client.data.user.sub),
          ],
          $size: 2,
        },
      },
      { id: true },
    );

    if (roomDoc === null) {
      client.disconnect();
      throw new WsException("no messages");
    }

    client.join(roomDoc.id);
  }
}
