import { ApiProperty } from "@nestjs/swagger";
import { Length } from "class-validator";

export class PasswordDto {
  @ApiProperty()
  @Length(8, 64)
  password: string;
}
