import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IProfile } from "src/profile/profile.interface";
import { Iso5218Sex } from "src/profile/iso-5218-sex.enum";
import { Types } from "mongoose";

@Schema()
export class Profile implements IProfile {
  @Prop({ type: Types.ObjectId, unique: true })
  authId: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({
    enum: Iso5218Sex,
  })
  isoSex: Iso5218Sex;

  @Prop()
  birthday: Date;

  @Prop()
  heightInCm: number;

  @Prop()
  weightInKg: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
