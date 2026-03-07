import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from "@nestjs/mongoose";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";
import { Connection, Model } from "mongoose";
import { User, UserSchema } from "../user/user.schema";
import { RegisterDto } from "./dto/register.dto";
import { Payload } from "../jwt/jwt.payload";
import { ea } from "../common/go-err";
import { AuthErrors } from "./auth.errors";
import { LoginDto } from "./dto/login.dto";

describe("AuthService", () => {
  let authService: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;

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
        JwtModule.register({
          secret: "TEST-SECRET",
          signOptions: { expiresIn: "2h" },
        }),
      ],
      providers: [AuthService],
    }).compile();

    const mongoc = module.get<Connection>(getConnectionToken());
    await mongoc.dropDatabase();

    authService = module.get(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get(JwtService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("register", () => {
    let registerDto = new RegisterDto();

    beforeEach(() => {
      registerDto.email = "john@email.com";
      registerDto.username = "john";
      registerDto.password = "password123";

      jest.spyOn(authService, "register");
    });

    it("should return valid jwt sub", async () => {
      const jwt = await authService.register(registerDto);

      const payload = jwtService.verify<Payload>(jwt);

      const doc = await userModel.findOne({ username: registerDto.username });

      expect(payload.sub).toBe(doc!.id);
    });

    it("should throw on email duplicates", async () => {
      await authService.register(registerDto);

      registerDto.username = "john2";

      var [_, err] = await ea(() => authService.register(registerDto));

      expect(err).toBe(AuthErrors.EMAIL_USED);
    });

    it("should throw on username duplicates", async () => {
      await authService.register(registerDto);

      registerDto.email = "john2@email.com";

      var [_, err] = await ea(() => authService.register(registerDto));

      expect(err).toBe(AuthErrors.USERNAME_USED);
    });
  });

  describe("login", () => {
    let loginDto = new LoginDto();

    beforeEach(async () => {
      const registerDto = new RegisterDto();

      registerDto.email = "john@email.com";
      registerDto.username = "john";
      registerDto.password = "password123";

      loginDto = registerDto;

      await authService.register(registerDto);

      jest.spyOn(authService, "login");
    });

    describe("with email", () => {
      beforeEach(() => {
        const { password, ...identity } = loginDto;
        loginDto = {
          email: identity.email,
          password,
        };
      });

      it("should return valid jwt sub", async () => {
        const jwt = await authService.login(loginDto);

        const payload = jwtService.verify<Payload>(jwt);

        const doc = await userModel.findOne({ email: loginDto.email });

        expect(payload.sub).toBe(doc!.id);
      });
    });

    describe("with username", () => {
      beforeEach(() => {
        const { password, ...identity } = loginDto;
        loginDto = {
          username: identity.username,
          password,
        };
      });

      it("should return valid jwt sub", async () => {
        const jwt = await authService.login(loginDto);

        const payload = jwtService.verify<Payload>(jwt);

        const doc = await userModel.findOne({ username: loginDto.username });

        expect(payload.sub).toBe(doc!.id);
      });
    });

    it("should handle a non matching password", async () => {
      loginDto.password = "wrong-password";

      var [_, err] = await ea(() => authService.login(loginDto));

      expect(err).toBe(AuthErrors.INVALID_PASSWORD);
    });
  });

  describe("getUsername", () => {
    it("should return correct username", async () => {
      const registerDto = new RegisterDto();

      registerDto.email = "john@email.com";
      registerDto.username = "john";
      registerDto.password = "password123";

      const { _id } = await userModel.create(registerDto);

      jest.spyOn(authService, "getUsername");

      const username = await authService.getUsername(_id);
      expect(username).toStrictEqual(registerDto.username);
    });
  });

  describe("getId", () => {
    it("should return correct id", async () => {
      const registerDto = new RegisterDto();

      registerDto.email = "john@email.com";
      registerDto.username = "john";
      registerDto.password = "password123";

      const { _id } = await userModel.create(registerDto);

      jest.spyOn(authService, "getId");

      const id = await authService.getId(registerDto.username);
      expect(id).toStrictEqual(_id);
    });
  });
});
