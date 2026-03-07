import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import Joi from "joi";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from "@nestjs/mongoose";
import { ProfileDto } from "src/profile/dto/profile.dto";
import { Connection, Model, Types } from "mongoose";
import { User, UserSchema } from "src/user/user.schema";

describe("ProfileService", () => {
  let service: ProfileService;
  let userModel: Model<User>;
  let userId: Types.ObjectId;
  let mongoc: Connection;

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
      ],
      providers: [ProfileService],
    }).compile();

    mongoc = module.get(getConnectionToken());
    await mongoc.dropDatabase();

    service = module.get(ProfileService);
    userModel = module.get(getModelToken(User.name));

    let authDoc = await userModel.create({
      email: "john@email.com",
      password: "password123",
      username: "john",
    });

    userId = authDoc._id;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("updates user", () => {
    let createDto = new ProfileDto();

    beforeEach(() => {
      createDto.name = "John Doe";
      createDto.birthday = new Date();
      createDto.heightInCm = 160;
      createDto.weightInKg = 60;
      createDto.isoSex = 1;

      jest.spyOn(service, "update");
    });

    it("creates a profile", async () => {
      await service.update(userId.toString(), createDto);

      const doc = await userModel.findById(userId, {
        name: true,
        birthday: true,
        heightInCm: true,
        weightInKg: true,
        isoSex: true,
        _id: false,
      });

      expect(doc!.toObject()).toEqual(createDto);
    });
  });

  describe("read profile", () => {
    let createDto = new ProfileDto();

    beforeEach(async () => {
      createDto.name = "John Doe";
      createDto.birthday = new Date();
      createDto.heightInCm = 160;
      createDto.weightInKg = 60;
      createDto.isoSex = 1;

      await service.update(userId.toString(), createDto);

      jest.spyOn(service, "update");
    });

    it("reads an existing profile", async () => {
      const doc = await service.findOne(userId.toString());
      expect(doc!.toObject()).toEqual(createDto);
    });

    it("returns null on non-existing profile", async () => {
      await userModel.findByIdAndDelete(userId);

      const doc = await service.findOne(userId.toString());
      expect(doc).toBeNull();
    });
  });
});
