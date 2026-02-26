import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ea } from "src/common/go-err";
import { ParseObjectIdPipe } from "@nestjs/mongoose";

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post("createProfile")
  async create(@Body() createProfileDto: CreateProfileDto) {
    var [id, err] = await ea(() =>
      this.profileService.create(createProfileDto),
    );

    if (err && err.code === 11000 && err.keyValue.email)
      throw new ConflictException("email already in use");

    return id!;
  }

  @Get("getProfile/:id")
  async findOne(@Param("id", ParseObjectIdPipe) id: string) {
    var [profile, _] = await ea(() => this.profileService.findOne(id));

    if (!profile) throw new NotFoundException();

    return this.profileService.findOne(id);
  }

  @Patch("updateProfile/:id")
  async update(
    @Param("id", ParseObjectIdPipe) id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    var [_, err] = await ea(() =>
      this.profileService.update(id, updateProfileDto),
    );

    if (err && err.code === 11000 && err.keyValue.email)
      throw new ConflictException("email already in use");

    return this.profileService.update(id, updateProfileDto);
  }
}
