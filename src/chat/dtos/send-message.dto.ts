import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString, Length } from "class-validator";

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @Length(1, 280)
  content: string;

  @ApiProperty()
  @IsMongoId()
  to: string;
}
