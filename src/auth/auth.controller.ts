import {
  Controller,
  Post,
  Body,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Param,
  Get,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "src/auth/dto/login.dto";
import { ea } from "src/common/go-err";
import { AuthErrors } from "src/auth/auth.errors";
import { Types } from "mongoose";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { ErrorResponseDto } from "src/common/error-response.dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  @ApiConflictResponse({ type: ErrorResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
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
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
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

  @Get("/getUsername/:id")
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
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

  @Get("/getId/:username")
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async getId(
    @Param("username")
    username: string,
  ) {
    var [id, err] = await ea(() => this.authService.getId(username));

    if (err === AuthErrors.NOT_FOUND)
      throw new NotFoundException("user not found");

    return id!.toString();
  }
}
