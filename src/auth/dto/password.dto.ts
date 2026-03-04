import { Length } from "class-validator";

export class PasswordDto {
  @Length(8, 64)
  password: string;
}
