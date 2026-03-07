import { PartialType } from "@nestjs/swagger";
import { ProfileDto } from "./profile.dto";

export class PartialProfileDto extends PartialType(ProfileDto) {}
