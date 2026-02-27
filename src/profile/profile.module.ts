import { Module } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Profile, ProfileSchema } from "src/profile/profile.schema";
import { Auth, AuthSchema } from "src/auth/auth.schema";
import { JwtStrategy } from "src/jwt/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, JwtStrategy],
})
export class ProfileModule {}
