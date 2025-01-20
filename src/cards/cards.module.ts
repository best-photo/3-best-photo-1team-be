import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [CardsController],
  providers: [CardsService, AuthService, UsersService],
})
export class CardsModule {}
