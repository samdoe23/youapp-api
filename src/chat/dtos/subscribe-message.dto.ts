import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class SubscribeMessageDto {
  @ApiProperty()
  @IsMongoId()
  from: string;
}
