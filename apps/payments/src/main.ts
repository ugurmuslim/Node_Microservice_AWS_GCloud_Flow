import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.connectMicroservice(
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.getOrThrow('RABBITMQ_URI')],
        queue: 'payments',
        noAck: false,
      },
    });
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices()
}
bootstrap();
