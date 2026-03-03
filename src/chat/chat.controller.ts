import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Types } from "mongoose";
import { ChatGateway } from "src/chat/chat.gateway";
import { ChatService } from "src/chat/chat.service";
import { SendMessageDto } from "src/chat/dtos/send-message.dto";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Payload } from "src/jwt/jwt.payload";

@Controller("")
@UseGuards(JwtGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post("/sendMessage")
  async sendMessage(
    @Body() message: SendMessageDto,
    @Req() req: Request & { user: Payload },
  ) {
    const roomId = await this.chatService.saveMessage(
      new Types.ObjectId(req.user.sub),
      new Types.ObjectId(message.to),
      message.content,
    );

    this.chatGateway.sendMessage(
      message.content,
      roomId,
      new Types.ObjectId(req.user.sub),
    );
  }
}
