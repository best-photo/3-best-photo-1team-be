import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

const swaggerCustomOptions = () => {
  const result: SwaggerCustomOptions = {
    customSiteTitle: '최애의 포토 API',
  };
  return result;
};

const swaggerOption = (): Omit<OpenAPIObject, 'paths'> => {
  const options = new DocumentBuilder()
    .setTitle('최애의 포토 API')
    .setDescription('최애의 포토 API 명세서')
    .setVersion('1.0')
    .addTag('auth', '인증 관리')
    .addTag('shop', '상점 관리')
    .addTag('cards', '카드 관리')
    .addTag('notifications', '알림 관리')
    .addTag('users', '사용자 관리')
    .addTag('points', '포인트 관리')
    .build();

  return options;
};

const docsOptions = {
  swagger: swaggerOption,
  swaggerCustom: swaggerCustomOptions,
};

export default docsOptions;
