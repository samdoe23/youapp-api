import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Iso5218Sex } from "src/auth/iso-5218-sex.enum";

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({
    type: Number,
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

export const UserSchema = SchemaFactory.createForClass(User);
