import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
  ConflictException,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ea } from "src/common/go-err";
import { ParseObjectIdPipe } from "@nestjs/mongoose";
import { Payload } from "src/jwt/jwt.payload";
import { JwtGuard } from "src/jwt/jwt.guard";
import { Errors } from "src/profile/profile.errors";

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
      this.profileService.create(createProfileDto, req.user.sub),
    );

    if (err !== undefined)
      throw (
        {
          [Errors.AUTH_ID_NOT_FOUND]: new NotFoundException(
            "no associated profile",
          ),
          [Errors.PROFILE_REGISTERED]: new ConflictException(
            "profile already registered",
          ),
        }[err] ?? err
      );
  }

  @Get("getProfile")
  async findOne(@Req() { user: { sub: authId } }: { user: Payload }) {
    var [profile, err] = await ea(() => this.profileService.findOne(authId));

    if (err !== undefined)
      throw (
        {
          [Errors.AUTH_ID_NOT_FOUND]: new NotFoundException(
            "no associated profile",
          ),
        }[err] ?? err
      );

    if (profile === null) throw new NotFoundException("profile not found");

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
          [Errors.PROFILE_NOT_FOUND]: new NotFoundException(
            "profile not found",
          ),
        }[err] ?? err
      );
  }
}
