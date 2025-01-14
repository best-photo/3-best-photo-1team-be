import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [PointsController],
  providers: [PointsService, AuthService],
})
export class PointsModule {}
