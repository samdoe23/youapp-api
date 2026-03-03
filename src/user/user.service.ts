import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/user/user.schema";

@Injectable()
export class UserService {
  @InjectModel(User.name)
  userModel: Model<User>;

  async exists(id: Types.ObjectId) {
    const doc = await this.userModel.findById(id, { _id: true });
    return doc !== null;
  }
}
