import { PartialType } from "@nestjs/mapped-types";
import { Length } from "class-validator";
import { IdentityDto } from "src/auth/dto/identity.dto";

export class LoginDto extends PartialType(IdentityDto) {
  @Length(8, 64)
  password: string;
}
