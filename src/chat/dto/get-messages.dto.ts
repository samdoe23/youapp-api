import { IsMongoId, IsOptional, IsPositive, Min } from "class-validator";

export class GetMessagesDto {
  @IsMongoId()
  conversationId: string;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Min(0)
  skip?: number;
}
