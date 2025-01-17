import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  SwaggerCustomOptions,
  OpenAPIObject,
} from '@nestjs/swagger';
import docsOptions from './shared/swagger/swagger.options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const customOption: SwaggerCustomOptions = docsOptions.swaggerCustom();
  const swaggerOptions: Omit<OpenAPIObject, 'paths'> = docsOptions.swagger();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api', app, document, customOption);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://best-photo-kappa.vercel.app',
      'https://ooyoo.dev',
      'https://www.ooyoo.dev',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8080, process.env.HOST ?? '0.0.0.0');
}
bootstrap();
