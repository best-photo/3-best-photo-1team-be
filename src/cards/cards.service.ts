import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProposeExchangeDto } from './dto/propose-exchange-card.dto';
import { AcceptExchangeCardDto } from './dto/accept-exchange-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async getCardByIdWithoutAuth(cardId: string) {
    // 카드와 소유자의 닉네임을 포함한 정보를 가져옴
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        owner: {
          select: {
            nickname: true, // 소유자의 닉네임만 가져옵니다
          },
        },
      },
    });

    // 카드가 존재하지 않을 경우 예외 처리
    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다');
    }

    // 카드 정보와 소유자 닉네임을 포함하여 반환
    return {
      ...card,
      nickname: card.owner?.nickname || 'Unknown', // 닉네임이 없을 경우 기본값 설정
    };
  }

  // 포토카드 교환 제안
  async proposePhotoCardExchange(
    shopId: string,
    proposeExchangeDto: ProposeExchangeDto,
    userId: string,
  ) {
    // 교환 제안 로직
    // 수량은 1개로 고정
    // 자신의 카드를 정보 + 수량은 1개로 고정
    // 교환제시 내용 추가

    return this.prisma.$transaction(async (tx) => {
      // 1. 상점 존재 여부 확인
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          card: true,
          seller: true,
        },
      });

      if (!shop) {
        throw new NotFoundException('상점을 찾을 수 없습니다.');
      }

      // 자신의 상점인지 확인
      if (shop.sellerId === userId) {
        throw new BadRequestException('자신의 카드와는 교환할 수 없습니다.');
      }

      // 2. 제안하는 카드가 실제로 사용자의 소유인지 확인
      const offeredCard = await tx.card.findFirst({
        where: {
          id: proposeExchangeDto.offeredCardId,
          ownerId: userId,
        },
      });

      if (!offeredCard) {
        throw new BadRequestException(
          '제안하려는 카드를 소유하고 있지 않습니다.',
        );
      }

      // 카드가 이미 교환 중인지 확인
      const existingExchange = await tx.exchange.findFirst({
        where: {
          OR: [
            { offeredCardId: proposeExchangeDto.offeredCardId },
            { targetCardId: proposeExchangeDto.offeredCardId },
          ],
          status: { in: ['REQUESTED', 'ACCEPTED'] },
        },
      });

      if (existingExchange) {
        throw new BadRequestException('이미 교환 중인 카드입니다.');
      }

      // 3. 교환 요청 생성
      const exchange = await tx.exchange.create({
        data: {
          requesterId: userId,
          offeredCardId: proposeExchangeDto.offeredCardId,
          targetCardId: shop.cardId,
          status: 'REQUESTED',
          description:
            proposeExchangeDto.exchangeDescription ||
            `${shop.card.name} 카드와 교환하고 싶습니다!`,
        },
        include: {
          offeredCard: true,
          requester: true,
          targetCard: true,
        },
      });

      // 4. 알림 생성
      await tx.notification.create({
        data: {
          userId: shop.sellerId,
          content: `새로운 교환 제안이 있습니다. ${offeredCard.name} 카드와의 교환을 제안받았습니다.`,
        },
      });

      // 5. 응답 데이터 구성
      return {
        exchangeId: exchange.id,
        offeredCard: {
          imageUrl: exchange.offeredCard.imageUrl,
          name: exchange.offeredCard.name,
          grade: exchange.offeredCard.grade,
          price: exchange.offeredCard.price,
        },
        requester: {
          nickname: exchange.requester.nickname,
        },
        exchangeDescription: proposeExchangeDto.exchangeDescription,
        status: exchange.status,
        createdAt: exchange.createdAt,
      };
    });
  }

  // 포토카드 교환 수락
  async acceptPhotoCardExchange(
    shopId: string,
    acceptExchangeCardDto: AcceptExchangeCardDto,
    userId: string,
  ) {
    // 교환 수락 로직
    // 교환 요청이 존재하는지 확인
    // 교환 요청이 존재하면 교환 요청 상태를 확인
    // 교환 요청 상태가 REQUESTED인 경우 ACCEPTED로 변경

    return this.prisma.$transaction(async (tx) => {
      // 1. 상점 존재 여부 확인
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          card: true,
          seller: true,
        },
      });

      if (!shop) {
        throw new NotFoundException('상점을 찾을 수 없습니다.');
      }

      // 상점 소유자 확인
      if (shop.sellerId !== userId) {
        throw new BadRequestException('교환 수락 권한이 없습니다.');
      }

      // 2. 교환 요청 존재 여부 확인
      const exchange = await tx.exchange.findFirst({
        where: {
          id: acceptExchangeCardDto.exchangeId,
          targetCardId: shop.cardId,
          status: 'REQUESTED', // 교환 요청 상태가 REQUESTED인 경우에만 수락 가능
        },
        include: {
          offeredCard: true,
          requester: true,
        },
      });

      if (!exchange) {
        throw new NotFoundException('교환 요청을 찾을 수 없습니다.');
      }

      // 3. 교환 요청 상태 변경
      const updatedExchange = await tx.exchange.update({
        where: { id: exchange.id },
        data: {
          status: 'ACCEPTED',
        },
        include: {
          offeredCard: true,
          requester: true,
        },
      });

      // 4. 교환 요청자에 알림 생성
      await tx.notification.create({
        data: {
          userId: exchange.requesterId, // 교환 요청자에게 알림
          content: `${shop.card.name} 카드와의 교환 제안이 수락되었습니다.`,
        },
      });

      // 5. 교환 요청자의 카드 소유권 변경
      await tx.card.update({
        where: { id: exchange.offeredCardId },
        data: {
          ownerId: shop.sellerId, // 상점 소유자에게 카드 소유권 이전
        },
      });

      // 6. 응답 데이터 구성
      return {
        exchangeId: updatedExchange.id,
        offeredCard: {
          imageUrl: updatedExchange.offeredCard.imageUrl,
          name: updatedExchange.offeredCard.name,
          grade: updatedExchange.offeredCard.grade,
          price: updatedExchange.offeredCard.price,
        },
        requester: {
          nickname: updatedExchange.requester.nickname,
        },
      };
    });
  }

  // 포토카드 교환 거절
  async rejectPhotoCardExchange(
    shopId: string,
    acceptExchangeCardDto: AcceptExchangeCardDto,
    userId: string,
  ) {
    // 교환 거절 로직
    // 교환 요청이 존재하는지 확인
    // 교환 요청이 존재하면 교환 요청 상태를 확인
    // 교환 요청 상태가 REQUESTED인 경우 REJECTED로 변경

    return this.prisma.$transaction(async (tx) => {
      // 1. 상점 존재 여부 확인
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          card: true,
          seller: true,
        },
      });

      if (!shop) {
        throw new NotFoundException('상점을 찾을 수 없습니다.');
      }

      // 상점 소유자 확인
      if (shop.sellerId !== userId) {
        throw new BadRequestException('교환 거절 권한이 없습니다.');
      }

      // 2. 교환 요청 존재 여부 확인
      const exchange = await tx.exchange.findFirst({
        where: {
          id: acceptExchangeCardDto.exchangeId,
          targetCardId: shop.cardId,
          status: 'REQUESTED', // 교환 요청 상태가 REQUESTED인 경우에만 거절 가능
        },
        include: {
          offeredCard: true,
          requester: true,
        },
      });

      if (!exchange) {
        throw new NotFoundException('교환 요청을 찾을 수 없습니다.');
      }

      // 3. 교환 요청 상태 변경
      const updatedExchange = await tx.exchange.update({
        where: { id: exchange.id },
        data: {
          status: 'REJECTED',
        },
        include: {
          offeredCard: true,
          requester: true,
        },
      });

      // 4. 교환 요청자에 알림 생성
      await tx.notification.create({
        data: {
          userId: exchange.requesterId,
          content: `${shop.card.name} 카드와의 교환 제안이 거절되었습니다.`,
        },
      });

      // 5. 응답 데이터 구성
      return {
        exchangeId: updatedExchange.id,
        offeredCard: {
          imageUrl: updatedExchange.offeredCard.imageUrl,
          name: updatedExchange.offeredCard.name,
          grade: updatedExchange.offeredCard.grade,
          price: updatedExchange.offeredCard.price,
        },
        requester: {
          nickname: updatedExchange.requester.nickname,
        },
      };
    });
  }

  // 포토카드 교환 취소
  async cancelPhotoCardExchange(
    shopId: string,
    acceptExchangeCardDto: AcceptExchangeCardDto,
    userId: string,
  ) {
    // 교환 취소 로직
    // 교환 요청이 존재하는지 확인
    // 교환 요청이 존재하면 교환 요청 상태를 확인
    // 교환 요청 상태가 REQUESTED인 경우 CANCELLED로 변경

    return this.prisma.$transaction(async (tx) => {
      // 1. 상점 존재 여부 확인
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          card: true,
          seller: true,
        },
      });

      if (!shop) {
        throw new NotFoundException('상점을 찾을 수 없습니다.');
      }

      // 상점 소유자 확인
      if (shop.sellerId !== userId) {
        throw new BadRequestException('교환 취소 권한이 없습니다.');
      }

      // 2. 교환 요청 존재 여부 확인
      const exchange = await tx.exchange.findFirst({
        where: {
          id: acceptExchangeCardDto.exchangeId,
          targetCardId: shop.cardId,
          status: 'REQUESTED', // 교환 요청 상태가 REQUESTED인 경우에만 취소 가능
        },
        include: {
          offeredCard: true,
          requester: true,
        },
      });

      if (!exchange) {
        throw new NotFoundException('교환 요청을 찾을 수 없습니다.');
      }

      // 4. 교환 요청 상태 변경
      const updatedExchange = await tx.exchange.update({
        where: { id: exchange.id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          offeredCard: {
            select: {
              imageUrl: true,
              name: true,
              grade: true,
              price: true,
            },
          },
          requester: {
            select: {
              nickname: true,
            },
          },
        },
      });

      // 5. 교환 요청자에 알림 생성
      await tx.notification.create({
        data: {
          userId: exchange.requesterId,
          content: `${shop.card.name} 카드와의 교환 제안이 취소 되었습니다.`,
        },
      });

      // 6. 응답 데이터 구성
      return {
        exchangeId: updatedExchange.id,
        offeredCard: {
          imageUrl: updatedExchange.offeredCard.imageUrl,
          name: updatedExchange.offeredCard.name,
          grade: updatedExchange.offeredCard.grade,
          price: updatedExchange.offeredCard.price,
        },
        requester: {
          nickname: updatedExchange.requester.nickname,
        },
      };
    });
  }
}
