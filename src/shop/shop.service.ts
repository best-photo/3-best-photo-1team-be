import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardGrade, CardGenre } from '@prisma/client';
import { ShopDetailsResponse } from './dto/shop.dto';

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

  // 판매 카드 상세 조회
  async getShopDetails(shopId: string): Promise<ShopDetailsResponse> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        card: {
          include: {
            owner: true, // 카드 소유자 정보
          },
        },
        seller: true, // 판매자 정보
      },
    });

    if (!shop) {
      throw new NotFoundException('판매 정보를 찾을 수 없습니다.');
    }

    return {
      card: {
        name: shop.card.name,
        imageUrl: shop.card.imageUrl,
        grade: shop.card.grade,
        genre: shop.card.genre,
        owner: shop.card.owner.nickname,
        description: shop.card.description,
      },
      shop: {
        price: shop.price,
        initialQuantity: shop.initialQuantity,
        remainingQuantity: shop.remainingQuantity,
        exchangeInfo: {
          grade: shop.exchangeGrade,
          genre: shop.exchangeGenre,
          description: shop.exchangeDescription,
        },
      },
    };
  }

  // 판매 정보 수정
  async update(id: string, updateShopDto: UpdateShopDto) {
    // 판매 정보가 존재하는지 확인
    const existingShop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        card: true,
      },
    });

    if (!existingShop) {
      throw new NotFoundException('판매 정보를 찾을 수 없습니다.');
    }

    // 수량 변경시 검증
    if (updateShopDto.quantity !== undefined) {
      const quantityDiff = updateShopDto.quantity - existingShop.quantity;
      const newRemainingQuantity =
        existingShop.card.remainingQuantity - quantityDiff;

      if (newRemainingQuantity < 0) {
        throw new Error('재고가 부족합니다.');
      }

      // 카드의 남은 수량도 업데이트
      await this.prisma.card.update({
        where: { id: existingShop.cardId },
        data: {
          remainingQuantity: newRemainingQuantity,
        },
      });
    }

    // 판매 정보 업데이트
    const updatedShop = await this.prisma.shop.update({
      where: { id },
      data: {
        price: updateShopDto.price,
        quantity: updateShopDto.quantity,
        exchangeGrade: updateShopDto.exchangeGrade,
        exchangeGenre: updateShopDto.exchangeGenre,
        exchangeDescription: updateShopDto.exchangeDescription,
      },
      include: {
        card: {
          include: {
            owner: true,
          },
        },
        seller: true,
      },
    });

    return {
      card: {
        name: updatedShop.card.name,
        imageUrl: updatedShop.card.imageUrl,
        grade: updatedShop.card.grade,
        genre: updatedShop.card.genre,
        owner: updatedShop.card.owner.nickname,
        description: updatedShop.card.description,
      },
      shop: {
        price: updatedShop.price,
        totalQuantity: updatedShop.card.totalQuantity,
        remainingQuantity: updatedShop.card.remainingQuantity,
        exchangeInfo: {
          grade: updatedShop.exchangeGrade,
          genre: updatedShop.exchangeGenre,
          description: updatedShop.exchangeDescription,
        },
      },
    };
  }

  // 판매 정보 삭제
  async remove(id: string) {
    // 판매 정보가 존재하는지 확인
    const existingShop = await this.prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new NotFoundException('판매 정보를 찾을 수 없습니다.');
    }

    // 판매 정보 삭제
    await this.prisma.shop.delete({
      where: { id },
    });

    return {
      message: `${id} 판매 정보가 성공적으로 삭제되었습니다.`,
    };
  }

  async getAllShops() {
    const shops = await this.prisma.shop.findMany({
      include: {
        card: true,
      },
    });

    return shops.map((shop) => ({
      id: shop.id,
      sellerId: shop.sellerId,
      cardId: shop.cardId,
      price: shop.price,
      quantity: shop.quantity,
      exchangeGrade: shop.exchangeGrade,
      exchangeGenre: shop.exchangeGenre,
      createdAt: shop.createdAt,
      card: {
        name: shop.card.name,
        grade: shop.card.grade,
        genre: shop.card.genre,
      },
    }));
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
        ? { price: 'desc' as const }
        : placeOrder === '낮은 가격순'
          ? { price: 'asc' as const }
          : placeOrder === '최신순'
            ? { createdAt: 'desc' as const }
            : placeOrder === '오래된 순'
              ? { createdAt: 'asc' as const }
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
        owner: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: orderBy ? [orderBy] : undefined,
    });

    return cards.map((card) => ({
      ...card,
      quantity: card.shop?.quantity || null,
      createdAt: card.shop?.createdAt || card.createdAt,
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
    const genreMap: Record<string, CardGenre> = {
      TRAVEL: CardGenre.TRAVEL,
      LANDSCAPE: CardGenre.LANDSCAPE,
      PORTRAIT: CardGenre.PORTRAIT,
      OBJECT: CardGenre.OBJECT,
    };

    const gradeMap: Record<string, CardGrade> = {
      COMMON: CardGrade.COMMON,
      RARE: CardGrade.RARE,
      SUPER_RARE: CardGrade.SUPER_RARE,
      LEGENDARY: CardGrade.LEGENDARY,
    };

    const { query, grade, genre } = filters;
    const cards = await this.prisma.card.findMany({
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

    return cards.map((card) => ({
      ...card,
    }));
  }

  async findCardByUserAndId(userId: string, cardId: string) {
    return this.prisma.card.findFirst({
      where: {
        id: cardId,
        ownerId: userId,
      },
    });
  }

  async getCardWithShop(cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        shop: true, // Shop 데이터를 포함
      },
    });

    return card;
  }

  findOne(id: number) {
    return `This action returns a #${id} shop`;
  }
}
