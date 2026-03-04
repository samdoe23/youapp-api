import { PickType } from "@nestjs/swagger";
import { FullMessageDto } from "src/chat/dtos/full-message.dto";

export class ViewMessagesDto extends PickType(FullMessageDto, ["from"]) {}
