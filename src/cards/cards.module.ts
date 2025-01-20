import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  controllers: [CardsController],
  providers: [CardsService, AuthGuard],
})
export class CardsModule {}
