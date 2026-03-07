import { IntersectionType, PartialType } from "@nestjs/swagger";
import { IdentityDto } from "./identity.dto";
import { PasswordDto } from "./password.dto";

export class LoginDto extends IntersectionType(
  PartialType(IdentityDto),
  PasswordDto,
) {}
