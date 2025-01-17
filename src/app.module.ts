import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CardsModule } from './cards/cards.module';
import { PointsModule } from './points/points.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ImageController } from './image/image.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    ShopModule,
    CardsModule,
    NotificationsModule,
    UsersModule,
    PointsModule,
  ],
  controllers: [AppController, ImageController],
  providers: [AppService],
})
export class AppModule {}
