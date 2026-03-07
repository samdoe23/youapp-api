import { IntersectionType } from "@nestjs/swagger";
import { IdentityDto } from "./identity.dto";
import { PasswordDto } from "./password.dto";

export class RegisterDto extends IntersectionType(IdentityDto, PasswordDto) {}
