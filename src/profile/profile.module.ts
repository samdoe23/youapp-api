import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/user/user.schema";
import { JwtStrategy } from "src/jwt/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, JwtStrategy],
})
export class ProfileModule {}
