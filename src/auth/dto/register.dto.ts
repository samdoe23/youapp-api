import { IntersectionType } from "@nestjs/swagger";
import { IdentityDto } from "src/auth/dto/identity.dto";
import { PasswordDto } from "src/auth/dto/password.dto";

export class RegisterDto extends IntersectionType(IdentityDto, PasswordDto) {}
