import { IsMongoId, IsString, Length } from "class-validator";

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @Length(1, 5000)
  content: string;
}
