import {
  Controller,
  Post,
  Body,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "src/auth/dto/login.dto";
import { ea } from "src/common/go-err";
import { LoginError, RegisterError } from "src/auth/auth.errors";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  async register(@Body() registerDto: RegisterDto) {
    var [jwt, err] = await ea(() => this.authService.register(registerDto));

    if (err !== undefined)
      throw (
        {
          [RegisterError.EMAIL_USED]: new ConflictException(
            "email is already in use",
          ),
          [RegisterError.USERNAME_USED]: new ConflictException(
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
          [LoginError.INVALID_PASSWORD]: new ForbiddenException(
            "unmatched credentials",
          ),
          [LoginError.NOT_FOUND]: new NotFoundException(
            "email or username not found",
          ),
        }[err] ?? err
      );

    return jwt;
  }
}
