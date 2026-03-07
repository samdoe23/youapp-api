import { Injectable } from "@nestjs/common";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../user/user.schema";
import { Errors } from "./profile.errors";

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

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
