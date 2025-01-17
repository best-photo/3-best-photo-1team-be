import { Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardGrade, CardGenre } from '@prisma/client';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShopDto: CreateShopDto) {
    const genreMap: Record<string, CardGenre> = {
      여행: CardGenre.TRAVEL,
      풍경: CardGenre.LANDSCAPE,
      인물: CardGenre.PORTRAIT,
      사물: CardGenre.OBJECT,
    };

    const gradeMap: Record<string, CardGrade> = {
      COMMON: CardGrade.COMMON,
      RARE: CardGrade.RARE,
      superRare: CardGrade.SUPER_RARE,
      LEGENDARY: CardGrade.LEGENDARY,
    };

    try {
      const shopEntry = await this.prisma.shop.create({
        data: {
          sellerId: createShopDto.sellerId,
          cardId: createShopDto.cardId,
          price: createShopDto.price,
          quantity: createShopDto.quantity,
          exchangeGrade: gradeMap[createShopDto.exchangeGrade],
          exchangeGenre: genreMap[createShopDto.exchangeGenre],
          exchangeDescription: createShopDto.exchangeDescription || null,
        },
      });

      await this.prisma.card.update({
        where: { id: createShopDto.cardId },
        data: {
          remainingQuantity: {
            decrement: createShopDto.quantity,
          },
        },
      });

      return shopEntry;
    } catch (error) {
      console.error('판매 등록 중 오류 발생:', error);
      throw new Error('판매 등록에 실패했습니다.');
    }
  }

  async findAll(filters: {
    query?: string;
    grade?: string;
    genre?: string;
    status?: string;
    placeOrder?: string;
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

    const { query, grade, genre, status, placeOrder } = filters;
    const statusFilter =
      status === 'IN_STOCK'
        ? { shop: { quantity: { gt: 0 } } }
        : status === 'OUT_OF_STOCK'
          ? { shop: { quantity: 0 } }
          : {};

    const orderBy =
      placeOrder === '높은 가격순'
        ? { shop: { price: 'desc' as const } }
        : placeOrder === '낮은 가격순'
          ? { shop: { price: 'asc' as const } }
          : placeOrder === '최신순'
            ? { shop: { createdAt: 'desc' as const } }
            : placeOrder === '오래된 순'
              ? { shop: { createdAt: 'asc' as const } }
              : undefined;

    const cards = await this.prisma.card.findMany({
      where: {
        shop: {
          isNot: null,
        },
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        grade: grade ? gradeMap[grade] : undefined,
        genre: genre ? genreMap[genre] : undefined,
        ...statusFilter,
      },
      include: {
        shop: true,
      },
      orderBy: orderBy ? [orderBy] : undefined,
    });

    return cards.map((card) => ({
      ...card,
      quantity: card.shop?.quantity || null,
      createdAt: card.shop?.createdAt || card.createdAt,
      remainingQuantity: undefined,
    }));
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

  async findCardByUserAndId(userId: string, cardId: string) {
    return this.prisma.card.findFirst({
      where: {
        id: cardId,
        ownerId: userId,
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
