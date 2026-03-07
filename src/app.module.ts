import { Module } from "@nestjs/common";
import { ProfileModule } from "./profile/profile.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

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
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: "2h" },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "swagger-for-vercel"),
      serveRoot: "/swagger-for-vercel",
    }),
    ProfileModule,
    AuthModule,
    ChatModule,
  ],
})
export class AppModule {}
