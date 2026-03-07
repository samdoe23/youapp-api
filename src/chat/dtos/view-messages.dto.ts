import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class ViewMessagesDto {
  @ApiProperty({ type: String })
  by: Types.ObjectId;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: String })
  timestamp: Date;
}
