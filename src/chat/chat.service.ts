import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Conversation } from "./conversation.schema";
import { Message } from "./message.schema";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { GetMessagesDto } from "./dto/get-messages.dto";
import { ChatErrors } from "./chat.errors";
import { RabbitMQService } from "src/rabbitmq/rabbitmq.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private rabbitMQ: RabbitMQService,
  ) {}

  async createConversation(
    userId: string,
    { recipientId }: CreateConversationDto,
  ) {
    if (userId === recipientId) {
      throw ChatErrors.CANNOT_CONVERSE_WITH_SELF;
    }

    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, recipientId], $size: 2 },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await this.conversationModel.create({
      participants: [userId, recipientId],
    });

    return conversation;
  }

  async getUserConversations(userId: string) {
    return this.conversationModel
      .find({ participants: userId })
      .sort({ updatedAt: -1 });
  }

  async sendMessage(
    userId: string,
    { conversationId, content }: SendMessageDto,
  ) {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw ChatErrors.CONVERSATION_NOT_FOUND;
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId,
    );

    if (!isParticipant) {
      throw ChatErrors.NOT_PARTICIPANT;
    }

    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(userId),
      content,
    });

    await this.rabbitMQ.publishMessage({
      conversationId,
      senderId: userId,
      content,
      createdAt: message.createdAt,
    });

    return message;
  }

  async getMessages(
    userId: string,
    { conversationId, limit = 50, skip = 0 }: GetMessagesDto,
  ) {
    const conversation = await this.conversationModel.findById(conversationId);

    if (!conversation) {
      throw ChatErrors.CONVERSATION_NOT_FOUND;
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId,
    );

    if (!isParticipant) {
      throw ChatErrors.NOT_PARTICIPANT;
    }

    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}
