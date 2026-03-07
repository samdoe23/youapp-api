import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Room } from "./room.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<Room>,
  ) {}

  async saveMessage({
    by,
    to,
    content,
    timestamp = new Date(),
  }: {
    by: Types.ObjectId;
    to: Types.ObjectId;
    content: string;
    timestamp?: Date;
  }) {
    const participants = [by, to];

    let roomDoc =
      (await this.roomModel.findOne({
        participants: { $all: participants, $size: 2 },
      })) ??
      (await this.roomModel.create({
        participants,
      }));

    await roomDoc.updateOne({
      $push: { messages: { by, content, timestamp } },
    });

    return roomDoc;
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
      { _id: true, participants: true },
    );

    return rooms;
  }
}
