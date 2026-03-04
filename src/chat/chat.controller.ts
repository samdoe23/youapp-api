import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";
import { ChatGateway } from "src/chat/chat.gateway";
import { ChatService } from "src/chat/chat.service";
import { SendMessageDto } from "src/chat/dtos/send-message.dto";
import { ViewMessagesDto } from "src/chat/dtos/view-messages.dto";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Payload } from "src/jwt/jwt.payload";
import { UserService } from "src/user/user.service";

@Controller()
@UseGuards(JwtGuard)
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
    const participants: [by: Types.ObjectId, to: Types.ObjectId] = [
      new Types.ObjectId(req.user.sub),
      new Types.ObjectId(message.to),
    ];

    if (!this.participantsExist(participants))
      throw new NotFoundException("user doesn't exist");

    const roomId = await this.chatService.saveMessage(
      ...participants,
      message.content,
    );

    this.chatGateway.sendMessage(
      message.content,
      roomId,
      new Types.ObjectId(req.user.sub),
    );
  }

  @Get("/viewMessages")
  async viewMessages(
    @Body() viewMesssagesDto: ViewMessagesDto,
    @Req() req: Request & { user: Payload },
  ) {
    const participants: [by: Types.ObjectId, to: Types.ObjectId] = [
      new Types.ObjectId(req.user.sub),
      new Types.ObjectId(viewMesssagesDto.from),
    ];

    if (!this.participantsExist(participants))
      throw new NotFoundException("user doesn't exist");

    const messages = (await this.chatService.getMessages(participants)) ?? [];

    return messages;
  }
}
