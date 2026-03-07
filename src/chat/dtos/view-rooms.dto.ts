import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class ViewRoomsDto {
  @ApiProperty({ type: String })
  id: Types.ObjectId;

  @ApiProperty({ type: Array<String> })
  participants: Types.ObjectId[];
}
