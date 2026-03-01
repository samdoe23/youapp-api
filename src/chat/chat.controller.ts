import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { GetMessagesDto } from "./dto/get-messages.dto";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Payload } from "src/jwt/jwt.payload";
import { ChatErrors } from "./chat.errors";

@UseGuards(JwtGuard)
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("conversations")
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Req() { user }: { user: Payload },
  ) {
    return this.chatService.createConversation(user.sub, createConversationDto);
  }

  @Get("conversations")
  async getConversations(@Req() { user }: { user: Payload }) {
    return this.chatService.getUserConversations(user.sub);
  }

  @Post("messages")
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Req() { user }: { user: Payload },
  ) {
    try {
      return await this.chatService.sendMessage(user.sub, sendMessageDto);
    } catch (error) {
      if (error === ChatErrors.CONVERSATION_NOT_FOUND) {
        throw new NotFoundException("Conversation not found");
      }
      if (error === ChatErrors.NOT_PARTICIPANT) {
        throw new ForbiddenException("Not a participant in this conversation");
      }
      throw error;
    }
  }

  @Get("messages")
  async getMessages(
    @Body() getMessagesDto: GetMessagesDto,
    @Req() { user }: { user: Payload },
  ) {
    try {
      return await this.chatService.getMessages(user.sub, getMessagesDto);
    } catch (error) {
      if (error === ChatErrors.CONVERSATION_NOT_FOUND) {
        throw new NotFoundException("Conversation not found");
      }
      if (error === ChatErrors.NOT_PARTICIPANT) {
        throw new ForbiddenException("Not a participant in this conversation");
      }
      throw error;
    }
  }
}
