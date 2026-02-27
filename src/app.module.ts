import { Module } from "@nestjs/common";
import { ProfileModule } from "./profile/profile.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required().uri(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get("MONGO_URI"),
      }),
    }),
    ProfileModule,
    AuthModule,
  ],
})
export class AppModule {}
