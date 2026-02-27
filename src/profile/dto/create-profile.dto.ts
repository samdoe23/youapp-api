import { Type } from "class-transformer";
import { IsDate, IsEnum, IsPositive, IsString, Length } from "class-validator";
import { IProfile } from "src/profile/profile.interface";
import { Iso5218Sex } from "src/profile/iso-5218-sex.enum";

export class CreateProfileDto implements IProfile {
  @IsString()
  @Length(3, 64)
  name: string;

  @IsEnum(Iso5218Sex)
  isoSex: Iso5218Sex;

  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @IsPositive()
  heightInCm: number;

  @IsPositive()
  weightInKg: number;
}
