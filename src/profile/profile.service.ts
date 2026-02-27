import { Injectable } from "@nestjs/common";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Profile } from "src/profile/profile.schema";
import { Auth } from "src/auth/auth.schema";
import { Errors } from "src/profile/profile.errors";
import { ea } from "src/common/go-err";

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    @InjectModel(Auth.name) private authModel: Model<Auth>,
  ) {}

  async create(createProfileDto: CreateProfileDto, authId: string) {
    const authDoc = await this.authModel.findById(authId);
    if (authDoc === undefined) throw Errors.AUTH_ID_NOT_FOUND;

    await this.profileModel.init();
    var [_, err] = await ea(() =>
      this.profileModel.create({
        authId: authDoc!._id,
        ...createProfileDto,
      }),
    );

    if (err !== undefined && err.code === 11000)
      throw Errors.PROFILE_REGISTERED;
  }

  async findOne(authId: string) {
    const authDoc = await this.authModel.findById(authId);
    if (authDoc === undefined) throw Errors.AUTH_ID_NOT_FOUND;

    const profile = await this.profileModel.findOne(
      { authId: authDoc!._id },
      {
        authId: false,
        _id: false,
        __v: false,
      },
    );

    return profile;
  }

  async update(authId: string, updateProfileDto: UpdateProfileDto) {
    const authDoc = await this.authModel.findById(authId);
    if (authDoc === undefined) throw Errors.AUTH_ID_NOT_FOUND;

    await this.profileModel.init();
    const { matchedCount } = await this.profileModel.updateOne(
      { authId: authDoc!._id },
      updateProfileDto,
    );

    if (matchedCount < 1) throw Errors.PROFILE_NOT_FOUND;
  }
}
