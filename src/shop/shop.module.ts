import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [ShopController],
  providers: [ShopService, AuthService],
})
export class ShopModule {}
