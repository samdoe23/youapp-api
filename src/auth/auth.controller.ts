import {
  Controller,
  Post,
  Body,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "src/auth/dto/login.dto";
import { ea } from "src/common/go-err";
import { AuthErrors } from "src/auth/auth.errors";
import { Types } from "mongoose";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() registerDto: RegisterDto) {
    var [jwt, err] = await ea(() => this.authService.register(registerDto));

    if (err !== undefined)
      throw (
        {
          [AuthErrors.EMAIL_USED]: new ConflictException(
            "email is already in use",
          ),
          [AuthErrors.USERNAME_USED]: new ConflictException(
            "username is already in use",
          ),
        }[err] ?? err
      );

    return jwt;
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto) {
    var [jwt, err] = await ea(() => this.authService.login(loginDto));

    if (err !== undefined)
      throw (
        {
          [AuthErrors.INVALID_PASSWORD]: new ForbiddenException(
            "unmatched credentials",
          ),
          [AuthErrors.NOT_FOUND]: new NotFoundException(
            "email or username not found",
          ),
        }[err] ?? err
      );

    return jwt;
  }

  @Post("/getUsername/:id")
  async getUsername(
    @Param("id", ParseObjectIdPipe)
    id: string,
  ) {
    var [username, err] = await ea(() =>
      this.authService.getUsername(new Types.ObjectId(id)),
    );

    if (err === AuthErrors.NOT_FOUND)
      throw new NotFoundException("user not found");

    return username!;
  }
}
