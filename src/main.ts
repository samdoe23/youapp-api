import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerModule.setup("docs", app, () =>
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

  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ?? 3000;
  const logger = new Logger("Bootstrap");
  await app.listen(port, host);
  logger.log(`Listening on ${host}:${port}`);
}
bootstrap();
