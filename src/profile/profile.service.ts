import { Injectable } from "@nestjs/common";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { Errors } from "src/profile/profile.errors";

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createProfileDto: CreateProfileDto, userId: string) {
    const { matchedCount } = await this.userModel.updateOne(
      { _id: userId },
      createProfileDto,
    );

    if (matchedCount < 1) throw Errors.USER_NOT_FOUND;
  }

  async findOne(userId: string) {
    const user = await this.userModel.findById(userId, {
      password: false,
      username: false,
      email: false,
      _id: false,
      __v: false,
    });

    return user;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const { matchedCount } = await this.userModel.updateOne(
      { _id: userId },
      updateProfileDto,
    );

    if (matchedCount < 1) throw Errors.USER_NOT_FOUND;
  }
}
