import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Card } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardGrade, CardGenre } from '@prisma/client';
import { ShopDetailsResponse } from './dto/shop.dto';
import { PurchaseCardDto } from './dto/purchase-card.dto';

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
      // 상점에 올렸는데 회원탈퇴한 경우 판매자 정보가 null이 될 수 있음
      card: shop.card
        ? {
            name: shop.card.name,
            imageUrl: shop.card.imageUrl,
            grade: shop.card.grade,
            genre: shop.card.genre,
            owner: shop.card.owner?.nickname ?? '소유자 정보 없음',
            description: shop.card.description,
          }
        : null,
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
    // 트랜잭션 적용
    return this.prisma.$transaction(async (tx) => {
      // 판매 정보가 존재하는지 확인
      const existingShop = await tx.shop.findUnique({
        where: { id },
        include: {
          card: {
            include: {
              owner: true,
            },
          },
        },
      });

      if (!existingShop) {
        throw new NotFoundException('판매 정보를 찾을 수 없습니다.');
      }

      // 수량 검증
      if (updateShopDto.initialQuantity !== undefined) {
        if (
          updateShopDto.initialQuantity <
          (updateShopDto.remainingQuantity ?? existingShop.remainingQuantity)
        ) {
          throw new BadRequestException(
            '초기 수량은 남은 수량보다 작을 수 없습니다.',
          );
        }
      }

      if (
        updateShopDto.initialQuantity != null &&
        updateShopDto.remainingQuantity != null
      ) {
        if (updateShopDto.initialQuantity < updateShopDto.remainingQuantity) {
          throw new BadRequestException(
            '초기 수량은 남은 수량보다 작을 수 없습니다.',
          );
        }
      }

      if (updateShopDto.remainingQuantity !== undefined) {
        if (
          (updateShopDto.initialQuantity ?? existingShop.initialQuantity) <
          updateShopDto.remainingQuantity
        ) {
          throw new BadRequestException(
            '남은 수량은 초기 수량보다 클 수 없습니다.',
          );
        }
      }

      // 판매 정보 업데이트
      const updatedShop = await tx.shop.update({
        where: { id },
        data: {
          price: updateShopDto.price,
          initialQuantity: updateShopDto.initialQuantity,
          remainingQuantity: updateShopDto.remainingQuantity,
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
          initialQuantity: updatedShop.initialQuantity,
          remainingQuantity: updatedShop.remainingQuantity,
          exchangeInfo: {
            grade: updatedShop.exchangeGrade,
            genre: updatedShop.exchangeGenre,
            description: updatedShop.exchangeDescription,
          },
        },
      };
    });
  }

  // 판매 정보 삭제
  async remove(id: string) {
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

  // 판매 포토 카드 구매
  async purchaseCard(userId: string, purchaseCardDto: PurchaseCardDto) {
    const { shopId, quantity } = purchaseCardDto;

    // 트랜잭션 시작
    return await this.prisma.$transaction(async (prisma) => {
      // 1. 상점 정보 조회
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          card: true,
          seller: true,
        },
      });

      // 상점 정보가 없으면 에러 발생
      if (!shop) {
        throw new NotFoundException('상점을 찾을 수 없습니다.');
      }

      // 자신의 카드는 구매할 수 없음
      if (shop.sellerId === userId) {
        throw new BadRequestException('자신의 카드는 구매할 수 없습니다.');
      }

      // 2. 재고 확인
      if (shop.card.remainingQuantity < quantity) {
        throw new Error('재고가 부족합니다.');
      }

      // 3. 구매자의 포인트 잔액 확인
      const buyerPoint = await prisma.point.findUnique({
        where: { userId },
      });

      if (!buyerPoint) {
        throw new NotFoundException('구매자 포인트 정보를 찾을 수 없습니다.');
      }

      const totalPrice = shop.price * quantity;

      if (buyerPoint.balance < totalPrice) {
        throw new BadRequestException('잔액이 부족합니다.');
      }

      // 4. 포인트 차감
      const updatedBuyerPoint = await prisma.point.update({
        where: {
          userId,
          balance: buyerPoint.balance, // 낙관적 락킹을 위한 조건
        },
        data: {
          // 동시성 문제 있음
          // balance: {
          //   decrement: buyerPoint.balance - totalPrice,
          // },
          balance: {
            decrement: totalPrice,
          },
        },
      });

      // 5. 판매자 포인트 추가
      await prisma.point.update({
        where: { userId: shop.sellerId },
        data: {
          balance: {
            increment: totalPrice,
          },
        },
      });

      // 6. 판매자 포인트 이력 생성
      await prisma.pointHistory.create({
        data: {
          userId: shop.sellerId,
          points: totalPrice,
          pointType: 'PURCHASE',
        },
      });

      // 6. 구매자 포인트 이력 생성
      await prisma.pointHistory.create({
        data: {
          userId: userId,
          points: -totalPrice,
          pointType: 'PURCHASE',
        },
      });

      // 7. 카드 재고 업데이트
      await prisma.card.update({
        where: { id: shop.cardId },
        data: {
          remainingQuantity: {
            decrement: quantity,
          },
        },
      });

      // 8. 구매 기록 생성
      const purchase = await prisma.purchase.create({
        data: {
          buyerId: userId,
          cardId: shop.cardId,
        },
      });

      // 9. 구매 알림 생성
      await prisma.notification.create({
        data: {
          userId: shop.sellerId,
          content: `회원님의 카드 "${shop.card.name}"가 ${quantity}개 판매되었습니다.`,
        },
      });

      return {
        message: '구매가 완료되었습니다.',
        data: {
          purchaseId: purchase.id,
          cardName: shop.card.name,
          quantity,
          totalPrice,
          remainingPoints: updatedBuyerPoint.balance,
        },
      };
    });
  }
}
