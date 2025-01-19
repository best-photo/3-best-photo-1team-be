import { FilterResult, BaseFilterService } from './service.types';
import { CardGenre } from '@prisma/client';

export default class GenreFilterService extends BaseFilterService {
  async execute(userId: string): Promise<FilterResult> {
    const shopGenreCounts = await Promise.all(
      Object.values(CardGenre).map((genre) =>
        this.prisma.shop.count({
          where: {
            card: {
              genre,
              ownerId: userId,
            },
          },
        }),
      ),
    );

    const exchangeGenreCounts = await Promise.all(
      Object.values(CardGenre).map((genre) =>
        this.prisma.exchange.count({
          where: {
            offeredCard: {
              genre,
              ownerId: userId,
            },
          },
        }),
      ),
    );

    const genreResult = Object.values(CardGenre).reduce((acc, genre, index) => {
      return {
        ...acc,
        [genre]: exchangeGenreCounts[index] + shopGenreCounts[index],
      };
    }, {});

    return genreResult;
  }
}
