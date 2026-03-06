import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Room } from "src/chat/room.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<Room>,
  ) {}

  async saveMessage(by: Types.ObjectId, to: Types.ObjectId, content: string) {
    const participants = [by, to];

    const doc = await this.roomModel.findOneAndUpdate(
      {
        participants: { $all: participants, $size: 2 },
      },
      {
        participants,
        $push: { messages: { by, content } },
      },
      { upsert: true, returnDocument: "after" },
    );

    return doc._id;
  }

  async getMessages(participants: Types.ObjectId[]) {
    const room = await this.roomModel.findOne({
      participants: { $all: participants, $size: 2 },
    });

    return room?.messages;
  }
}
