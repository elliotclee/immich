import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SERVER_VERSION } from '@app/domain';
import { getLogLevels } from '@app/domain';
import { RedisIoAdapter } from '@app/infra';
import { MicroservicesModule } from './microservices.module';
import { MetadataExtractionProcessor } from './processors/metadata-extraction.processor';

const logger = new Logger('ImmichMicroservice');
const port = Number(process.env.MICROSERVICES_PORT) || 3002;
const envName = (process.env.NODE_ENV || 'development').toUpperCase();

async function bootstrap() {
  const app = await NestFactory.create(MicroservicesModule, { logger: getLogLevels() });

  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const metadataService = app.get(MetadataExtractionProcessor);

  process.on('uncaughtException', (error: Error | any) => {
    const isCsvError = error.code === 'CSV_RECORD_INCONSISTENT_FIELDS_LENGTH';
    if (!isCsvError) {
      throw error;
    }

    logger.warn('Geocoding csv parse error, trying again without cache...');
    metadataService.init(true);
  });

  await metadataService.init();

  await app.listen(port);

  logger.log(`Listening on port ${port} (version=${SERVER_VERSION} mode=${envName})`);
}

bootstrap();
