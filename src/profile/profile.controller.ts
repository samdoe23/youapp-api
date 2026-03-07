import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  NotFoundException,
  UseGuards,
  Param,
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ApiSecurity } from "@nestjs/swagger";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { JwtGuard } from "../jwt/jwt.guard";
import { Payload } from "../jwt/jwt.payload";
import { ea } from "../common/go-err";
import { Errors } from "./profile.errors";

@ApiSecurity("accessTokenHeader")
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtGuard)
  @Post("createProfile")
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: Request & { user: Payload },
  ) {
    var [_, err] = await ea(() =>
      this.profileService.update(req.user.sub, createProfileDto),
    );

    if (err !== undefined)
      throw (
        {
          [Errors.USER_NOT_FOUND]: new NotFoundException("user not found"),
        }[err] ?? err
      );
  }

  @Get("getProfile/:id")
  async findOne(@Param("id", ParseObjectIdPipe) authId: string) {
    var [profile, err] = await ea(() => this.profileService.findOne(authId));

    if (err !== undefined)
      throw (
        {
          [Errors.USER_NOT_FOUND]: new NotFoundException("user not found"),
        }[err] ?? err
      );

    return profile!;
  }

  @UseGuards(JwtGuard)
  @Patch("updateProfile")
  async update(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() { user: { sub: authId } }: { user: Payload },
  ) {
    var [_, err] = await ea(() =>
      this.profileService.update(authId, updateProfileDto),
    );

    if (err !== undefined)
      throw (
        {
          [Errors.USER_NOT_FOUND]: new NotFoundException("user not found"),
        }[err] ?? err
      );
  }
}
