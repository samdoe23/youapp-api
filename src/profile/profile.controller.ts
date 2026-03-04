import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ea } from "src/common/go-err";
import { Payload } from "src/jwt/jwt.payload";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Errors } from "src/profile/profile.errors";
import { ApiSecurity } from "@nestjs/swagger";

@ApiSecurity("accessTokenHeader")
@UseGuards(JwtGuard)
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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

  @Get("getProfile")
  async findOne(@Req() { user: { sub: authId } }: { user: Payload }) {
    var [profile, err] = await ea(() => this.profileService.findOne(authId));

    if (err !== undefined)
      throw (
        {
          [Errors.USER_NOT_FOUND]: new NotFoundException("user not found"),
        }[err] ?? err
      );

    return profile!;
  }

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
