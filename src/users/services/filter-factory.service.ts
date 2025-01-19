import { PrismaService } from 'src/prisma/prisma.service';
import GenreFilterService from './genre-filter.service';
import GradeFilterService from './grade-filter.service';
import SalesMethodFilterService from './sales-method-filter.service';
import { BaseFilterService } from './service.types';
import StockStateFilterService from './stock-state-filter.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class FilterServiceFactory {
  constructor(private prisma: PrismaService) {}

  getService(filter: string): BaseFilterService {
    switch (filter) {
      case 'grade':
        return new GradeFilterService(this.prisma);
      case 'genre':
        return new GenreFilterService(this.prisma);
      case 'salesMethod':
        return new SalesMethodFilterService(this.prisma);
      case 'stockState':
        return new StockStateFilterService(this.prisma);
      default:
        throw new Error('올바른 filter를 입력해 주세요.');
    }
  }
}
