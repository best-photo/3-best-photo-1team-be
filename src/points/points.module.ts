import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PointsController],
  providers: [PointsService, AuthService],
})
export class PointsModule {}
