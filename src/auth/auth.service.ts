import { Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "src/auth/dto/login.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Auth } from "src/auth/auth.schema";
import { hash } from "src/auth/hasher";
import * as argon2 from "argon2";
import { LoginError, RegisterError } from "src/auth/auth.errors";
import { ea } from "src/common/go-err";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password: plainPassword, ...identity } = registerDto;
    const hashedPassword = await hash(plainPassword);

    await this.authModel.init();
    var [doc, err] = await ea(() =>
      this.authModel.create({
        ...identity,
        password: hashedPassword,
      }),
    );

    if (err !== undefined && err.code === 11000)
      throw (
        {
          username: RegisterError.USERNAME_USED,
          email: RegisterError.EMAIL_USED,
        }[Object.keys(err.keyPattern)[0]] ?? err
      );

    return await this.jwtService.signAsync({ sub: doc!.id });
  }

  async login({ email, username, password }: LoginDto) {
    const doc = await this.authModel.findOne(
      { $or: [{ email }, { username }] },
      { password: true },
    );

    if (doc === null) throw LoginError.NOT_FOUND;

    const passwordMatches = await argon2.verify(doc!.password, password);
    if (!passwordMatches) throw LoginError.INVALID_PASSWORD;

    return await this.jwtService.signAsync({ sub: doc!.id });
  }
}
