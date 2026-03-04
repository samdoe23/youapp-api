import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IdentityDto } from "src/auth/dto/identity.dto";
import { PasswordDto } from "src/auth/dto/password.dto";

export class LoginDto extends IntersectionType(
  PartialType(IdentityDto),
  PasswordDto,
) {}
