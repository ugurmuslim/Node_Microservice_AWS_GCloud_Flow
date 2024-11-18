import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { PAYMENTS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.connectMicroservice(
    {
      transport: Transport.GRPC,
      options: {
        package: PAYMENTS_PACKAGE_NAME,
        protoPath: join(__dirname, '../../../proto/payments.proto'),
        url: configService.getOrThrow('PAYMENTS_GRPC_URL'),
      },
    });
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices()
}
bootstrap();
