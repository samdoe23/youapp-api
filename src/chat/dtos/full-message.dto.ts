import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, Length } from "class-validator";

export class FullMessageDto {
  @ApiProperty()
  @Length(1, 280)
  content: string;

  @ApiProperty()
  @IsMongoId()
  from: string;

  @ApiProperty()
  @IsMongoId()
  to: string;
}
