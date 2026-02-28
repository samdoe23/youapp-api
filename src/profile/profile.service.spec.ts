import { Test, TestingModule } from "@nestjs/testing";
import { ProfileService } from "./profile.service";
import Joi from "joi";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Profile, ProfileSchema } from "src/profile/profile.schema";
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from "@nestjs/mongoose";
import { Auth, AuthSchema } from "src/auth/auth.schema";
import { CreateProfileDto } from "src/profile/dto/create-profile.dto";
import { Connection, Model, Types } from "mongoose";
import { ea } from "src/common/go-err";
import { Errors } from "src/profile/profile.errors";
import { UpdateProfileDto } from "src/profile/dto/update-profile.dto";

describe("ProfileService", () => {
  let service: ProfileService;
  let profileModel: Model<Profile>;
  let authModel: Model<Auth>;
  let authId: Types.ObjectId;
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
        MongooseModule.forFeature([
          { name: Profile.name, schema: ProfileSchema },
          { name: Auth.name, schema: AuthSchema },
        ]),
      ],
      providers: [ProfileService],
    }).compile();

    mongoc = module.get(getConnectionToken());
    await mongoc.dropDatabase();

    service = module.get(ProfileService);
    profileModel = module.get(getModelToken(Profile.name));
    authModel = module.get(getModelToken(Auth.name));

    let authDoc = await authModel.create({
      email: "john@email.com",
      password: "password123",
      username: "john",
    });

    authId = authDoc._id;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create profile", () => {
    let createDto = new CreateProfileDto();

    beforeEach(() => {
      createDto.name = "John Doe";
      createDto.birthday = new Date();
      createDto.heightInCm = 160;
      createDto.weightInKg = 60;
      createDto.isoSex = 1;

      jest.spyOn(service, "create");
    });

    it("creates a profile", async () => {
      await service.create(createDto, authId.toString());

      const doc = await profileModel.findOne(
        { authId },
        {
          name: true,
          birthday: true,
          heightInCm: true,
          weightInKg: true,
          isoSex: true,
          _id: false,
        },
      );

      expect(doc!.toObject()).toEqual(createDto);
    });

    it("dosen't create duplicate profiles", async () => {
      await service.create(createDto, authId.toString());

      var [_, err] = await ea(() =>
        service.create(createDto, authId.toString()),
      );

      expect(err).toBe(Errors.PROFILE_REGISTERED);
    });
  });

  describe("read profile", () => {
    let createDto = new CreateProfileDto();

    beforeEach(async () => {
      createDto.name = "John Doe";
      createDto.birthday = new Date();
      createDto.heightInCm = 160;
      createDto.weightInKg = 60;
      createDto.isoSex = 1;

      await service.create(createDto, authId.toString());

      jest.spyOn(service, "create");
    });

    it("reads an existing profile", async () => {
      const doc = await service.findOne(authId.toString());
      expect(doc!.toObject()).toEqual(createDto);
    });

    it("returns null on non-existing profile", async () => {
      await profileModel.deleteOne({ authId });

      const doc = await service.findOne(authId.toString());
      expect(doc).toBeNull();
    });
  });

  describe("update profile", () => {
    let createDto = new CreateProfileDto();

    beforeEach(async () => {
      createDto.name = "John Doe";
      createDto.birthday = new Date();
      createDto.heightInCm = 160;
      createDto.weightInKg = 60;
      createDto.isoSex = 1;

      await service.create(createDto, authId.toString());

      jest.spyOn(service, "create");
    });

    it("succesfully updates height", async () => {
      const newHeight = 165;
      await service.update(authId.toString(), { heightInCm: newHeight });
      const doc = await profileModel.findOne({ authId });
      expect(doc!.heightInCm).toBe(newHeight);
    });
  });
});
