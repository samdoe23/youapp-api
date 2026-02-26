import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { argon2Sync, randomBytes } from "node:crypto";
import { IProfile } from "src/profile/profile.interface";
import { Iso5218Sex } from "src/profile/iso-5218-sex.enum";

@Schema()
export class Profile implements IProfile {
  @Prop({ required: true, length: [1, 32] })
  username: string;

  @Prop({ required: true, length: [3, 64] })
  realname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    required: true,
    set: (plain: string): string =>
      argon2Sync("argon2id", {
        message: plain,
        nonce: randomBytes(16),
        parallelism: 1,
        tagLength: 64,
        memory: 2 ** 15, // ~32MB
        passes: 3,
      }).toString(),
  })
  password: string;

  @Prop({
    enum: Iso5218Sex,
    required: true,
  })
  isoSex: Iso5218Sex;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ required: true, min: 0 })
  heightInCm: number;

  @Prop({ required: true, min: 0 })
  weightInKg: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
