import { FilterResult, BaseFilterService } from './service.types';
import { CardGrade } from '@prisma/client';

export default class GradeFilterService extends BaseFilterService {
  async execute(userId: string): Promise<FilterResult> {
    const shopCounts = await Promise.all(
      Object.values(CardGrade).map((grade) =>
        this.prisma.shop.count({
          where: {
            card: {
              grade,
              ownerId: userId,
            },
          },
        }),
      ),
    );

    const exchangeCounts = await Promise.all(
      Object.values(CardGrade).map((grade) =>
        this.prisma.exchange.count({
          where: {
            offeredCard: {
              grade,
              ownerId: userId,
            },
          },
        }),
      ),
    );

    const gradeResult = Object.values(CardGrade).reduce((acc, grade, index) => {
      return {
        ...acc,
        [grade]: shopCounts[index] + exchangeCounts[index],
      };
    }, {});

    return gradeResult;
  }
}
