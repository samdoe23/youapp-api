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
import { ChatService } from "src/chat/chat.service";
import { Room, RoomSchema } from "src/chat/room.schema";
import { User, UserSchema } from "src/user/user.schema";

describe("ChatService", () => {
  let chatService: ChatService;
  let userModel: Model<User>;
  let roomModel: Model<Room>;
  let jwtService: JwtService;
  let johnId: Types.ObjectId;
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
  });

  it("should be defined", () => {
    expect(chatService).toBeDefined();
  });

  describe("saveMessage", () => {
    it("should save messages", async () => {
      const msg = "hi";
      await chatService.saveMessage(johnId, samId, msg);
      const room = await roomModel.findOne({
        participants: { $all: [johnId, samId], $size: 2 },
      });

      expect(room).not.toBeNull();

      expect(room?.participants).toHaveLength(2);
      expect(room?.participants).toContainEqual(johnId);
      expect(room?.participants).toContainEqual(samId);

      expect(room?.messages).toHaveLength(1);
      expect(room?.messages).toContainEqual({ by: johnId, content: msg });
    });
  });

  describe("getMessages", () => {
    it("should view messages", async () => {
      const johnMessage = "hi";
      const samMessage = "hello";
      await chatService.saveMessage(johnId, samId, johnMessage);
      await chatService.saveMessage(samId, samId, samMessage);
      const messages = await chatService.getMessages([johnId, samId]);

      expect(messages).toHaveLength(2);
      expect(messages).toContainEqual({ by: johnId, content: johnMessage });
      expect(messages).toContainEqual({ by: samId, content: samMessage });
    });
  });
});
