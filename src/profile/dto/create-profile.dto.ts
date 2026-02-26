import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { IProfile } from "src/profile/profile.interface";
import { Iso5218Sex } from "src/profile/iso-5218-sex.enum";

export class CreateProfileDto implements IProfile {
  @IsString()
  @Length(1, 32)
  username: string;

  @IsString()
  @Length(3, 64)
  realname: string;

  @IsString()
  password: string;

  @IsEnum(Iso5218Sex)
  isoSex: Iso5218Sex;

  @IsEmail()
  email: string;

  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @IsPositive()
  heightInCm: number;

  @IsPositive()
  weightInKg: number;
}
