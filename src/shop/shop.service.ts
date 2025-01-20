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
import { PurchaseCardDto } from './dto/purchase-card.dto';
import { PurchaseResponseDto } from './dto/purchase-response.dto';

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
          initialQuantity: createShopDto.quantity,
          remainingQuantity: createShopDto.quantity,
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
  // async getShopDetails(shopId: string): Promise<ShopDetailsResponse> {
  //   const shop = await this.prisma.shop.findUnique({
  //     where: { id: shopId },
  //     include: {
  //       card: {
  //         include: {
  //           owner: true, // 카드 소유자 정보
  //         },
  //       },
  //       seller: true, // 판매자 정보
  //     },
  //   });

  //   if (!shop) {
  //     throw new NotFoundException('판매 정보를 찾을 수 없습니다.');
  //   }

  //   return {
  //     // 상점에 올렸는데 회원탈퇴한 경우 판매자 정보가 null이 될 수 있음
  //     card: shop.card
  //       ? {
  //           name: shop.card.name,
  //           imageUrl: shop.card.imageUrl,
  //           grade: shop.card.grade,
  //           genre: shop.card.genre,
  //           owner: shop.card.owner?.nickname ?? '소유자 정보 없음',
  //           description: shop.card.description,
  //         }
  //       : null,
  //     shop: {
  //       price: shop.price,
  //       initialQuantity: shop.initialQuantity,
  //       remainingQuantity: shop.remainingQuantity,
  //       exchangeInfo: {
  //         grade: shop.exchangeGrade,
  //         genre: shop.exchangeGenre,
  //         description: shop.exchangeDescription,
  //       },
  //     },
  //   };
  // }

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
      quantity: shop.remainingQuantity,
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
        ? { Shop: { remainingQuantity: { gt: 0 } } }
        : status === 'OUT_OF_STOCK'
          ? { Shop: { remainingQuantity: 0 } }
          : undefined; // 필터 없음

    const orderBy =
      placeOrder === '높은 가격순'
        ? { Shop: { price: 'desc' as const } }
        : placeOrder === '낮은 가격순'
          ? { Shop: { price: 'asc' as const } }
          : placeOrder === '최신순'
            ? { Shop: { createdAt: 'desc' as const } }
            : placeOrder === '오래된 순'
              ? { Shop: { createdAt: 'asc' as const } }
              : undefined;

    const cards = await this.prisma.card.findMany({
      where: {
        Shop: {
          isNot: null,
        },
        name: query ? { contains: query, mode: 'insensitive' } : undefined,
        grade: grade ? gradeMap[grade] : undefined,
        genre: genre ? genreMap[genre] : undefined,
        ...statusFilter,
      },
      include: {
        Shop: true,
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
      quantity: card.Shop?.remainingQuantity || null,
      price: card.Shop?.price || null,
      initialQuantity: card.Shop?.initialQuantity || null,
      remainingQuantity: card.Shop?.remainingQuantity || null,
      createdAt: card.Shop?.createdAt || card.createdAt,
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
        Shop: {
          is: null,
        },
      },
      include: {
        owner: {
          select: {
            nickname: true,
          },
        },
      },
    });

    const result = cards.map((card) => ({
      ...card,
      nickname: card.owner?.nickname || 'Unknown',
    }));
    console.log(result);
    return result;
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
        Shop: true, // Shop 데이터를 포함
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

      // 2. 재고 확인 (Shop의 remainingQuantity 사용)
      if (shop.remainingQuantity < quantity) {
        throw new BadRequestException('재고가 부족합니다.');
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

      // 4. 구매자 포인트 차감
      const updatedBuyerPoint = await prisma.point.update({
        where: {
          userId,
          balance: buyerPoint.balance, // 낙관적 락킹을 위한 조건
        },
        data: {
          balance: {
            decrement: totalPrice,
          },
        },
      });

      // 5. 판매자 포인트 추가
      // 판매자 포인트 역시 동시에 여러 거래가 발생할 수 있으므로 낙관적 락킹을 사용
      const sellerPoint = await prisma.point.findUnique({
        where: { userId: shop.sellerId },
      });

      if (!sellerPoint) {
        throw new NotFoundException('판매자 포인트 정보를 찾을 수 없습니다.');
      }

      await prisma.point.update({
        where: {
          userId: shop.sellerId,
          balance: sellerPoint.balance, // 낙관적 락킹 조건 추가
        },
        data: {
          balance: {
            increment: totalPrice,
          },
        },
      });

      // 6. 포인트 이력 생성 (판매자, 구매자)
      await Promise.all([
        prisma.pointHistory.create({
          data: {
            userId: shop.sellerId,
            points: totalPrice,
            pointType: 'PURCHASE',
          },
        }),
        prisma.pointHistory.create({
          data: {
            userId: userId,
            points: -totalPrice,
            pointType: 'PURCHASE',
          },
        }),
      ]);

      // 7. Shop의 재고 업데이트
      await prisma.shop.update({
        where: {
          id: shopId,
          remainingQuantity: shop.remainingQuantity, // 낙관적 락킹을 위한 조건, 재고 수량이 변경되었을 경우 업데이트가 실패함
        },
        data: {
          remainingQuantity: {
            decrement: quantity,
          },
        },
      });

      // 8. 판매자 카드 수량 감소
      const sellerCard = await prisma.card.findFirst({
        where: { id: shop.cardId },
      });

      if (!sellerCard) {
        throw new Error('판매자의 카드 정보를 찾을 수 없습니다.');
      }

      await prisma.card.update({
        where: { id: sellerCard.id },
        data: {
          totalQuantity: {
            decrement: quantity,
          },
        },
      });

      // 9. 구매자 카드 소유량 처리
      const buyerCard = await prisma.card.findFirst({
        where: {
          id: shop.cardId,
          ownerId: userId,
        },
      });

      if (buyerCard) {
        // 이미 같은 카드를 가지고 있는 경우 수량 증가
        await prisma.card.update({
          where: { id: buyerCard.id },
          data: {
            totalQuantity: {
              increment: quantity,
            },
          },
        });
      } else {
        // 새로운 카드를 생성하는 경우
        await prisma.card.create({
          data: {
            ownerId: userId,
            name: sellerCard.name,
            price: sellerCard.price,
            imageUrl: sellerCard.imageUrl,
            grade: sellerCard.grade,
            genre: sellerCard.genre,
            description: sellerCard.description,
            totalQuantity: quantity,
            remainingQuantity: quantity, // 현재는 사용되지 않지만 데이터 일관성을 위해 포함
          },
        });
      }

      // 9. 구매 기록 생성
      const purchase = await prisma.purchase.create({
        data: {
          buyerId: userId,
          shopId: shopId,
        },
      });

      // 10. 구매 알림 생성 (구매자, 판매자 모두에게 알림)
      await Promise.all([
        prisma.notification.create({
          data: {
            userId: shop.sellerId,
            content: `회원님의 카드 \"${shop.card.name}\"가 ${quantity}개 판매되었습니다.`,
          },
        }),
        prisma.notification.create({
          data: {
            userId: userId,
            content: `\"${shop.card.name}\" 카드 ${quantity}개를 성공적으로 구매하였습니다.`,
          },
        }),
      ]);

      return {
        message: '구매가 완료되었습니다.',
        data: {
          purchaseId: purchase.id,
          cardName: shop.card.name,
          quantity,
          totalPrice,
          remainingPoints: updatedBuyerPoint.balance,
        },
      } satisfies PurchaseResponseDto;
    });
  }

  async getFilterCountsByCategory(category: string): Promise<number[]> {
    const validCategories = ['grades', 'genres', 'stockState'];

    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    if (category === 'grades') {
      const allGrades = Object.values(CardGrade);

      const grades = await this.prisma.card.groupBy({
        by: ['grade'],
        _count: { id: true },
        where: {
          Shop: {
            isNot: null,
          },
        },
      });

      const gradeCounts = allGrades.map((grade) => {
        const matchingGrade = grades.find((g) => g.grade === grade);
        return matchingGrade ? matchingGrade._count.id : 0;
      });
      return gradeCounts;
    }

    if (category === 'genres') {
      const allGenres = Object.values(CardGenre);

      const genres = await this.prisma.card.groupBy({
        by: ['genre'],
        _count: { id: true },
        where: {
          Shop: {
            isNot: null,
          },
        },
      });

      const genreCounts = allGenres.map((genre) => {
        const matchingGenre = genres.find((g) => g.genre === genre);
        return matchingGenre ? matchingGenre._count.id : 0;
      });
      console.log('genres : ', genreCounts);
      return genreCounts;
    }

    if (category === 'stockState') {
      const stockState = [
        await this.prisma.shop.count({
          where: { remainingQuantity: { gt: 0 } },
        }),
        await this.prisma.shop.count({
          where: { remainingQuantity: 0 },
        }),
      ];
      return stockState;
    }
    return [];
  }

  async getFilterCountsByCategoryAndUser(
    category: string,
    userId: string,
  ): Promise<number[]> {
    const validCategories = ['grades', 'genres', 'stockState'];

    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    if (category === 'grades') {
      const allGrades = Object.values(CardGrade);

      const grades = await this.prisma.card.groupBy({
        by: ['grade'],
        _count: { id: true },
        where: {
          ownerId: userId,
          Shop: {
            is: null,
          },
        },
      });

      const gradeCounts = allGrades.map((grade) => {
        const matchingGrade = grades.find((g) => g.grade === grade);
        return matchingGrade ? matchingGrade._count.id : 0;
      });
      return gradeCounts;
    }

    if (category === 'genres') {
      const allGenres = Object.values(CardGenre);

      const genres = await this.prisma.card.groupBy({
        by: ['genre'],
        _count: { id: true },
        where: {
          ownerId: userId,
          Shop: {
            is: null,
          },
        },
      });

      const genreCounts = allGenres.map((genre) => {
        const matchingGenre = genres.find((g) => g.genre === genre);
        return matchingGenre ? matchingGenre._count.id : 0;
      });
      return genreCounts;
    }

    if (category === 'stockState') {
      const stockState = [
        await this.prisma.card.count({
          where: {
            ownerId: userId,
            Shop: {
              is: null,
            },
            remainingQuantity: { gt: 0 },
          },
        }),
        await this.prisma.card.count({
          where: {
            ownerId: userId,
            Shop: {
              is: null,
            },
            remainingQuantity: 0,
          },
        }),
      ];
      return stockState;
    }
  }
}
