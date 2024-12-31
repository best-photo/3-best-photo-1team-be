import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ShopModule } from './shop/shop.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CardsModule } from './cards/cards.module';
import { PointsModule } from './points/points.module';

@Module({
  imports: [
    AuthModule,
    ShopModule,
    CardsModule,
    NotificationsModule,
    UsersModule,
    UsersModule,
    NotificationsModule,
    CardsModule,
    PointsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
