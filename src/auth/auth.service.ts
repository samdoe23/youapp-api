import { Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "src/auth/dto/login.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/user/user.schema";
import { hash } from "src/auth/hasher";
import * as argon2 from "argon2";
import { AuthErrors } from "src/auth/auth.errors";
import { ea } from "src/common/go-err";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password: plainPassword, ...identity } = registerDto;
    const hashedPassword = await hash(plainPassword);

    await this.userModel.init();
    var [doc, err] = await ea(() =>
      this.userModel.create({
        ...identity,
        password: hashedPassword,
      }),
    );

    if (err !== undefined && err.code === 11000)
      throw (
        {
          username: AuthErrors.USERNAME_USED,
          email: AuthErrors.EMAIL_USED,
        }[Object.keys(err.keyPattern)[0]] ?? err
      );

    return await this.jwtService.signAsync({ sub: doc!.id });
  }

  async login({ email, username, password }: LoginDto) {
    const doc = await this.userModel.findOne(
      { $or: [{ email }, { username }] },
      { password: true },
    );

    if (doc === null) throw AuthErrors.NOT_FOUND;

    const passwordMatches = await argon2.verify(doc!.password, password);
    if (!passwordMatches) throw AuthErrors.INVALID_PASSWORD;

    return await this.jwtService.signAsync({ sub: doc!.id });
  }

  async getUsername(id: Types.ObjectId) {
    const doc = await this.userModel.findById(id, { username: true });

    if (doc === null) throw AuthErrors.NOT_FOUND;

    return doc.username;
  }
}
