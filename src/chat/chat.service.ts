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

    let doc =
      (await this.roomModel.findOne({
        participants: { $all: participants, $size: 2 },
      })) ??
      (await this.roomModel.create({
        participants,
      }));

    await doc.updateOne({
      $push: { messages: { by, content } },
    });

    return doc._id;
  }

  async getMessages(participants: Types.ObjectId[]) {
    const room = await this.roomModel.findOne({
      participants: { $all: participants, $size: 2 },
    });

    return room?.messages;
  }

  async getRoomIds(participants: Types.ObjectId[]) {
    const rooms = await this.roomModel.find(
      {
        participants: { $all: participants, $size: 2 },
      },
      { _id: true },
    );

    return rooms.map((r) => r._id);
  }
}
