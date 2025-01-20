import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [ShopController],
  providers: [ShopService, AuthService, UsersService],
})
export class ShopModule {}
