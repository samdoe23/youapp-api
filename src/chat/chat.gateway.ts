import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
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
import { SubscribeMessageDto } from "src/chat/dtos/subscribe-message.dto";
import { Room } from "src/chat/room.schema";
import { WsJwtGuard } from "src/jwt/jwt.guard";
import { UserService } from "src/user/user.service";

@UsePipes(new ValidationPipe({ exceptionFactory: (e) => new WsException(e) }))
@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly userService: UserService,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
  ) {}

  private readonly chatroom = (room: Types.ObjectId) => `chat-${room}`;

  sendMessage(message: string, room: Types.ObjectId, by: Types.ObjectId) {
    this.server.to(this.chatroom(room)).emit("messages", { by, message });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("messages")
  async subscribeMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SubscribeMessageDto,
  ) {
    const participants = [
      new Types.ObjectId(payload.from),
      new Types.ObjectId(client.data.user.sub),
    ];

    for (const p of participants) {
      const userExists = await this.userService.exists(p);
      if (!userExists) throw new WsException("user doesn't exist");
    }

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
