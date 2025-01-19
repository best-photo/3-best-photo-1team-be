import { FilterResult, BaseFilterService } from './service.types';

export default class SalesMethodFilterService extends BaseFilterService {
  async execute(userId: string): Promise<FilterResult> {
    const salesMethodCount = await Promise.all([
      this.prisma.shop.count({
        where: {
          sellerId: userId,
        },
      }),
      this.prisma.exchange.count({
        where: {
          requesterId: userId,
        },
      }),
    ]);

    const salesMethodResult = {
      sale: salesMethodCount[0],
      exchange: salesMethodCount[1],
    };

    return salesMethodResult;
  }
}
