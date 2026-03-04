import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length } from "class-validator";

export class IdentityDto {
  @ApiProperty()
  @Length(1, 32)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
