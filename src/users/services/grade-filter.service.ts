import { FilterResult, BaseFilterService } from './service.types';
import { CardGrade } from '@prisma/client';

export default class GradeFilterService extends BaseFilterService {
  async execute(userId: string): Promise<FilterResult> {
    const grades = Object.values(CardGrade);
    const results = await Promise.all(
      grades.map(async (grade) => {
        const [shopCount, exchangeCount] = await Promise.all([
          this.prisma.shop.count({
            where: {
              card: {
                grade,
                ownerId: userId,
              },
            },
          }),
          this.prisma.exchange.count({
            where: {
              offeredCard: {
                grade,
                ownerId: userId,
              },
            },
          }),
        ]);
        return { grade, count: shopCount + exchangeCount };
      }),
    );

    return results.reduce(
      (acc, { grade, count }) => ({
        ...acc,
        [grade]: count,
      }),
      {},
    );
  }
}
