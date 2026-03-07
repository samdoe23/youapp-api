import { Type } from "class-transformer";
import { IsDate, IsEnum, IsPositive, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IProfile } from "../../auth/profile.interface";
import { Iso5218Sex } from "../../auth/iso-5218-sex.enum";

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
