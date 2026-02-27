import { Length } from "class-validator";
import { IdentityDto } from "src/auth/dto/identity.dto";

export class RegisterDto extends IdentityDto {
  @Length(8, 64)
  password: string;
}
