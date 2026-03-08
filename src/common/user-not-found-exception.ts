import { NotFoundException } from "@nestjs/common";

export const UserNotFoundError = new NotFoundException("user not found");
