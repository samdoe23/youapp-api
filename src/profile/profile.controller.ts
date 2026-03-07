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
import { ProfileDto } from "./dto/profile.dto";
import { PartialProfileDto } from "./dto/partial-profile.dto";
import { ea } from "src/common/go-err";
import { Payload } from "src/jwt/jwt.payload";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Errors } from "src/profile/profile.errors";
import { ApiSecurity } from "@nestjs/swagger";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@ApiSecurity("accessTokenHeader")
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtGuard)
  @Post("createProfile")
  async create(
    @Body() createProfileDto: ProfileDto,
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
  async findOne(
    @Param("id", ParseObjectIdPipe) authId: string,
  ): Promise<PartialProfileDto> {
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
    @Body() updateProfileDto: PartialProfileDto,
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
