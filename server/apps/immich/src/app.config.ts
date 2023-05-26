import { IMMICH_ACCESS_COOKIE, IMMICH_API_KEY_HEADER, IMMICH_API_KEY_NAME, SERVER_VERSION } from '@app/domain';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import path from 'path';
import { patchOpenAPI } from './utils/patch-open-api.util';

export const isDev = process.env.NODE_ENV === 'development';

export const useSwagger = (app: INestApplication) => {
  const docConfig = new DocumentBuilder()
    .setTitle('Immich')
    .setDescription('Immich API')
    .setVersion(SERVER_VERSION)
    .addBearerAuth({ type: 'http', scheme: 'Bearer', in: 'header' })
    .addCookieAuth(IMMICH_ACCESS_COOKIE)
    .addApiKey({ type: 'apiKey', in: 'header', name: IMMICH_API_KEY_HEADER }, IMMICH_API_KEY_NAME)
    .addServer('/api')
    .build();

  const operationIdFactory = (controllerKey: string, methodKey: string) => methodKey;

  const apiDocument = SwaggerModule.createDocument(app, docConfig, { operationIdFactory });

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Immich API Documentation',
  };

  SwaggerModule.setup('doc', app, apiDocument, customOptions);

  if (isDev) {
    // Generate API Documentation only in development mode
    const outputPath = path.resolve(process.cwd(), 'immich-openapi-specs.json');
    writeFileSync(outputPath, JSON.stringify(patchOpenAPI(apiDocument), null, 2), { encoding: 'utf8' });
  }
};
