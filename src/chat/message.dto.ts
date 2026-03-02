import { IsMongoId, IsString, Length } from "class-validator";

export class MessageDto {
  @IsString()
  @Length(1, 280)
  content: string;

  @IsMongoId()
  to: string;
}
