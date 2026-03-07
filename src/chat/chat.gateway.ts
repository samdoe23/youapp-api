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
import { UserService } from "../user/user.service";
import { Message, Room } from "./room.schema";
import { WsJwtGuard } from "../jwt/jwt.guard";
import { SubscribeMessageDto } from "./dtos/subscribe-message.dto";

@UsePipes(new ValidationPipe({ exceptionFactory: (e) => new WsException(e) }))
@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly userService: UserService,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
  ) {}

  private readonly chatroom = (room: Types.ObjectId) => `chat-${room}`;

  sendMessage(message: Message, room: Types.ObjectId) {
    this.server.to(this.chatroom(room)).emit("messages", message);
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

    let roomId: Types.ObjectId;

    const roomDoc = await this.roomModel.findOne(
      {
        participants: {
          $all: participants,
          $size: 2,
        },
      },
      { _id: true },
    );

    if (roomDoc === null) {
      const { _id } = await this.roomModel.create({
        participants: participants,
      });
      roomId = _id;
    } else {
      roomId = roomDoc._id;
    }

    await client.join(this.chatroom(roomId));

    return true;
  }
}
