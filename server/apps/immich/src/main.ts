import { getLogLevels, MACHINE_LEARNING_ENABLED, SearchService, SERVER_VERSION } from '@app/domain';
import { RedisIoAdapter } from '@app/infra';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { isDev, useSwagger } from './app.config';
import { AppModule } from './app.module';

const logger = new Logger('ImmichServer');
const envName = (process.env.NODE_ENV || 'development').toUpperCase();
const port = Number(process.env.SERVER_PORT) || 3001;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: getLogLevels() });

  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
  app.set('etag', 'strong');
  app.use(cookieParser());
  app.use(json({ limit: '10mb' }));

  if (isDev) {
    app.enableCors();
  }

  app.useWebSocketAdapter(new RedisIoAdapter(app));

  useSwagger(app);

  const searchService = app.get(SearchService);
  await searchService.bootstrap();

  await app.listen(port);

  logger.log(`Listening on port ${port} (version=${SERVER_VERSION} mode=${envName})`);
  logger.log(`Machine learning is ${MACHINE_LEARNING_ENABLED ? 'enabled' : 'disabled'}`);
  logger.log(`Search is ${searchService.isEnabled() ? 'enabled' : 'disabled'}`);
}
bootstrap();
