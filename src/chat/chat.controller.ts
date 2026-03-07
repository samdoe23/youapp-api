import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { ApiSecurity } from "@nestjs/swagger";
import { Types } from "mongoose";
import { ChatGateway } from "src/chat/chat.gateway";
import { ChatService } from "src/chat/chat.service";
import { SendMessageDto } from "src/chat/dtos/send-message.dto";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Payload } from "src/jwt/jwt.payload";
import { UserService } from "src/user/user.service";

@Controller()
@UseGuards(JwtGuard)
@ApiSecurity("accessTokenHeader")
export class ChatController {
  constructor(
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private async participantsExist(participants: Types.ObjectId[]) {
    for (const p of participants) {
      const userExists = await this.userService.exists(p);
      if (!userExists) return false;
    }
    return true;
  }

  @Post("/sendMessage")
  async sendMessage(
    @Body() message: SendMessageDto,
    @Req() req: Request & { user: Payload },
  ) {
    const by = new Types.ObjectId(req.user.sub);
    const to = new Types.ObjectId(message.to);
    const content = message.content;
    const timestamp = new Date();
    const participants: [by: Types.ObjectId, to: Types.ObjectId] = [by, to];

    if (!this.participantsExist(participants))
      throw new NotFoundException("user doesn't exist");

    const room = await this.chatService.saveMessage({
      by,
      to,
      content,
      timestamp,
    });

    this.chatGateway.sendMessage({ by, content, timestamp }, room._id);
  }

  @Get("/viewMessages/:from")
  async viewMessages(
    @Param("from", ParseObjectIdPipe) from: string,
    @Req() req: Request & { user: Payload },
  ) {
    const participants: [by: Types.ObjectId, to: Types.ObjectId] = [
      new Types.ObjectId(req.user.sub),
      new Types.ObjectId(from),
    ];

    if (!this.participantsExist(participants))
      throw new NotFoundException("user doesn't exist");

    const messages = (await this.chatService.getMessages(participants)) ?? [];

    return messages;
  }

  @Get("/viewRooms")
  async viewRooms(@Req() req: Request & { user: Payload }) {
    const rooms = await this.chatService.getRoomIds([
      new Types.ObjectId(req.user.sub),
    ]);

    return rooms.map(({ _id, participants }) => ({
      id: _id,
      participants: participants
        .map((p) => p.toString())
        .filter((p) => p !== req.user.sub),
    }));
  }
}
