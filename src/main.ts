import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerModule.setup("api", app, () =>
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("YouApp API")
        .setVersion("1.0")
        .addSecurity("accessTokenHeader", {
          type: "apiKey",
          in: "header",
          name: "x-access-token",
        })
        .build(),
    ),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000, process.env.HOST ?? "localhost");
}
bootstrap();
