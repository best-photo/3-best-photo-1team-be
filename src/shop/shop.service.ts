import { Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardGrade, CardGenre } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  create(createShopDto: CreateShopDto) {
    return 'This action adds a new shop';
  }

  async findAll(filters: {
    query?: string;
    grade?: string;
    genre?: string;
    status?: string;
    priceOrder?: string;
  }): Promise<Card[]> {
    const gradeMap: Record<string, CardGrade> = {
      common: CardGrade.COMMON,
      rare: CardGrade.RARE,
      superRare: CardGrade.SUPER_RARE,
      legendary: CardGrade.LEGENDARY,
    };

    const genreMap: Record<string, CardGenre> = {
      travel: CardGenre.TRAVEL,
      landscape: CardGenre.LANDSCAPE,
      portrait: CardGenre.PORTRAIT,
      object: CardGenre.OBJECT,
    };

    const { query, grade, genre, status, priceOrder } = filters;
    console.log('Filters:', {
      query,
      grade: grade ? gradeMap[grade] : undefined,
      genre: genre ? genreMap[genre] : undefined,
    });
    // 상태 필터링
    const statusFilter =
      status === '판매 중'
        ? { remainingQuantity: { gt: 0 } }
        : status === '판매 완료'
          ? { remainingQuantity: 0 }
          : {};

    // 정렬 기준 변환
    const orderBy =
      priceOrder === '높은 가격순'
        ? { price: 'desc' as const }
        : priceOrder === '낮은 가격순'
          ? { price: 'asc' as const }
          : priceOrder === '최신순'
            ? { createdAt: 'desc' as const }
            : priceOrder === '오래된 순'
              ? { createdAt: 'asc' as const }
              : undefined;

    return await this.prisma.card.findMany({
      where: {
        shop: {
          isNot: null,
        },
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        grade: grade ? gradeMap[grade] : undefined,
        genre: genre ? genreMap[genre] : undefined,
        ...statusFilter,
      },
      orderBy: orderBy ? [orderBy] : undefined,
    });
  }

  async findUserCards(
    userId: string,
    filters: {
      query?: string;
      grade?: string;
      genre?: string;
    },
  ): Promise<Card[]> {
    const gradeMap: Record<string, CardGrade> = {
      common: CardGrade.COMMON,
      rare: CardGrade.RARE,
      superRare: CardGrade.SUPER_RARE,
      legendary: CardGrade.LEGENDARY,
    };

    const genreMap: Record<string, CardGenre> = {
      travel: CardGenre.TRAVEL,
      landscape: CardGenre.LANDSCAPE,
      portrait: CardGenre.PORTRAIT,
      object: CardGenre.OBJECT,
    };

    const { query, grade, genre } = filters;

    return await this.prisma.card.findMany({
      where: {
        ownerId: userId,
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        grade: grade ? gradeMap[grade] : undefined,
        genre: genre ? genreMap[genre] : undefined,
        shop: {
          is: null,
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} shop`;
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return `This action updates a #${id} shop`;
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
}
