import { Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardGrade } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  create(createShopDto: CreateShopDto) {
    return 'This action adds a new shop';
  }

  private formatGrade(value: string): string {
    return value.replace(/\s+/g, '_').toUpperCase();
  }

  async findAll(filters: {
    query?: string;
    grade?: 'COMMON' | 'RARE' | 'SUPER_RARE' | 'LEGENDARY';
    genre?: 'TRAVEL' | 'LANDSCAPE' | 'PORTRAIT' | 'OBJECT';
    status?: '판매 중' | '판매 완료';
    priceOrder?: '최신순' | '오래된 순' | '높은 가격순' | '낮은 가격순';
  }): Promise<Card[]> {
    const gradeMap = {
      COMMON: CardGrade.COMMON,
      RARE: CardGrade.RARE,
      'SUPER RARE': CardGrade.SUPER_RARE,
      LEGENDARY: CardGrade.LEGENDARY,
    };

    const genreMap = {
      여행: 'TRAVEL',
      풍경: 'LANDSCAPE',
      인물: 'PORTRAIT',
      사물: 'OBJECT',
    };

    console.log('Filters Received in Service:', filters);
    const { query, grade, genre, status, priceOrder } = filters;

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
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        grade: grade ? gradeMap[grade] : undefined,
        genre: genre ? genreMap[genre] : undefined,
        ...statusFilter,
      },
      orderBy: orderBy ? [orderBy] : undefined,
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
