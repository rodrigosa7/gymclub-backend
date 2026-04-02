import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./shared/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.APP_PORT ?? 4000);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  console.log(`Gym Club backend listening on http://localhost:${port}`);
}

void bootstrap();
