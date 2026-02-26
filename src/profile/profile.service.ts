import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Profile } from "src/profile/profile.schema";

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    await this.profileModel.init();
    let { id } = await this.profileModel.create(createProfileDto);

    return id;
  }

  async findOne(id: string) {
    const profile = await this.profileModel.findById(id, {
      password: false,
      _id: false,
      __v: false,
    });

    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    await this.profileModel.init();
    const { matchedCount } = await this.profileModel.updateOne(
      { _id: id },
      updateProfileDto,
    );

    if (matchedCount < 1) throw new NotFoundException();
  }
}
