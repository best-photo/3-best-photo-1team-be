import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';
import FilterServiceFactory from './services/filter-factory.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthService, FilterServiceFactory],
  exports: [UsersService],
})
export class UsersModule {}
