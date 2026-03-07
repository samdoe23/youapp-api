import { Injectable } from "@nestjs/common";
import { PartialProfileDto } from "./dto/partial-profile.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { Errors } from "src/profile/profile.errors";

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

  async update(userId: string, updateProfileDto: PartialProfileDto) {
    const { matchedCount } = await this.userModel.updateOne(
      { _id: userId },
      updateProfileDto,
    );

    if (matchedCount < 1) throw Errors.USER_NOT_FOUND;
  }
}
