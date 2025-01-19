import { FilterResult, BaseFilterService } from './service.types';

export default class StockStateFilterService extends BaseFilterService {
  async execute(userId: string): Promise<FilterResult> {
    const inStockCount = await Promise.all([
      this.prisma.shop.count({
        where: {
          quantity: { gt: 0 },
        },
      }),
      this.prisma.exchange.count({
        where: {
          requesterId: userId,
        },
      }),
    ]);

    const outOfStockCount = await this.prisma.shop.count({
      where: {
        quantity: { equals: 0 },
      },
    });
    const stockStateResult = {
      inStock: inStockCount[0] + inStockCount[1],
      outOfStock: outOfStockCount,
    };

    return stockStateResult;
  }
}
