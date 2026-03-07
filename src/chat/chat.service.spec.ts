import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import Joi from "joi";
import { Connection, Model, Types } from "mongoose";
import { User, UserSchema } from "../user/user.schema";
import { ChatService } from "./chat.service";
import { Message, Room, RoomSchema } from "./room.schema";

describe("ChatService", () => {
  let chatService: ChatService;
  let userModel: Model<User>;
  let roomModel: Model<Room>;
  let jwtService: JwtService;
  let johnId: Types.ObjectId;
  let janeId: Types.ObjectId;
  let samId: Types.ObjectId;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ".env.test",
          isGlobal: true,
          validationSchema: Joi.object({
            MONGO_TEST_URI: Joi.string().required().uri(),
          }),
        }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get("MONGO_TEST_URI"),
          }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
        JwtModule.register({
          secret: "TEST-SECRET",
          signOptions: { expiresIn: "2h" },
        }),
      ],
      providers: [ChatService],
    }).compile();

    const mongoc = module.get<Connection>(getConnectionToken());
    await mongoc.dropDatabase();

    chatService = module.get(ChatService);
    userModel = module.get(getModelToken(User.name));
    roomModel = module.get(getModelToken(Room.name));
    jwtService = module.get(JwtService);

    johnId = (
      await userModel.create({
        email: "john@email.com",
        password: "password123",
        username: "john",
      })
    )._id;

    samId = (
      await userModel.create({
        email: "sam@email.com",
        password: "password123",
        username: "sam",
      })
    )._id;

    janeId = (
      await userModel.create({
        email: "jane@email.com",
        password: "password123",
        username: "jane",
      })
    )._id;
  });

  it("should be defined", () => {
    expect(chatService).toBeDefined();
  });

  describe("saveMessage", () => {
    it("should save messages", async () => {
      const message = {
        by: johnId,
        to: samId,
        content: "hi",
        timestamp: new Date(),
      };
      await chatService.saveMessage(message);
      const room = await roomModel.findOne({
        participants: { $all: [johnId, samId], $size: 2 },
      });

      expect(room).not.toBeNull();

      expect(room?.participants).toHaveLength(2);
      expect(room?.participants).toContainEqual(johnId);
      expect(room?.participants).toContainEqual(samId);

      expect(room?.messages).toHaveLength(1);
      expect(room?.messages).toContainEqual(new Message(message));
    });
  });

  describe("getMessages", () => {
    it("should view messages", async () => {
      const johnMessage = {
        by: johnId,
        to: samId,
        content: "hi",
        timestamp: new Date(),
      };
      const samMessage = {
        by: samId,
        to: johnId,
        content: "hello",
        timestamp: new Date(),
      };
      await chatService.saveMessage(johnMessage);
      await chatService.saveMessage(samMessage);
      const messages = await chatService.getMessages([johnId, samId]);

      expect(messages).toHaveLength(2);
      expect(messages).toContainEqual(new Message(johnMessage));
      expect(messages).toContainEqual(new Message(samMessage));
    });
  });

  describe("getRooms", () => {
    it("should view rooms", async () => {
      const msg1 = {
        by: johnId,
        to: samId,
        content: "hi",
        timestamp: new Date(),
      };
      const msg2 = {
        by: janeId,
        to: samId,
        content: "hey",
        timestamp: new Date(),
      };
      const msg3 = {
        by: janeId,
        to: johnId,
        content: "hello",
        timestamp: new Date(),
      };

      await chatService.saveMessage(msg1);
      await chatService.saveMessage(msg2);
      await chatService.saveMessage(msg3);

      const samRooms = await chatService.getRoomIds([samId]);
      const samJohnChatroom = await chatService.getRoomIds([samId, johnId]);
      const samJaneChatroom = await chatService.getRoomIds([samId, janeId]);
      const johnJaneChatroom = await chatService.getRoomIds([johnId, janeId]);

      expect(samRooms).toHaveLength(2);
      expect(samJohnChatroom).toHaveLength(1);
      expect(samJaneChatroom).toHaveLength(1);
      expect(johnJaneChatroom).toHaveLength(1);
      expect(samRooms).toContainEqual(samJohnChatroom[0]);
      expect(samRooms).toContainEqual(samJaneChatroom[0]);
      expect(samRooms).not.toContainEqual(johnJaneChatroom[0]);
    });
  });
});
