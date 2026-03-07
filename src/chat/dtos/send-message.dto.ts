import { PickType } from "@nestjs/swagger";
import { FullMessageDto } from "./full-message.dto";

export class SendMessageDto extends PickType(FullMessageDto, [
  "content",
  "to",
]) {}
