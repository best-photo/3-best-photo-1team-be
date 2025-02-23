import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN'),
        },
        refreshSecret: config.get<string>('JWT_REFRESH_SECRET'),
        refreshSignOptions: {
          expiresIn: config.get<string>('JWT_REFRESH_EXPIRES_IN'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
