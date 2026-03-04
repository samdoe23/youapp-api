import { Type } from "class-transformer";
import { IsDate, IsEnum, IsPositive, IsString, Length } from "class-validator";
import { IProfile } from "src/auth/profile.interface";
import { Iso5218Sex } from "src/auth/iso-5218-sex.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfileDto implements IProfile {
  @ApiProperty()
  @IsString()
  @Length(3, 64)
  name: string;

  @ApiProperty()
  @IsEnum(Iso5218Sex)
  isoSex: Iso5218Sex;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  birthday: Date;

  @ApiProperty()
  @IsPositive()
  heightInCm: number;

  @ApiProperty()
  @IsPositive()
  weightInKg: number;
}
