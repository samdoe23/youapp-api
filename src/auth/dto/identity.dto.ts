import { IsEmail, Length } from "class-validator";

export class IdentityDto {
  @Length(1, 32)
  username: string;

  @IsEmail()
  email: string;
}
