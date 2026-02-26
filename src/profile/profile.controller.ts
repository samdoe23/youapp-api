import { Controller, Get, Post, Body, Patch, Param } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post("createProfile")
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get("getProfile/:id")
  findOne(@Param("id") id: string) {
    return this.profileService.findOne(+id);
  }

  @Patch("updateProfile/:id")
  update(@Param("id") id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(+id, updateProfileDto);
  }
}
