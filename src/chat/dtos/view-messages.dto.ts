import { PickType } from "@nestjs/swagger";
import { FullMessageDto } from "./full-message.dto";

export class ViewMessagesDto extends PickType(FullMessageDto, ["from"]) {}
