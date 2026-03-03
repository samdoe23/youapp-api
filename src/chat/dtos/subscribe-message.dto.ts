import { IsMongoId } from "class-validator";

export class SubscribeMessageDto {
  @IsMongoId()
  from: string;
}
