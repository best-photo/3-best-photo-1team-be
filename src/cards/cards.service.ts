import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProposeExchangeDto } from './dto/propose-exchange-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  create(createCardDto: CreateCardDto) {
    return 'This action adds a new card';
  }

  findAll() {
    return `This action returns all cards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }

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

  async proposePhotoCardExchange(
    shopId: string,
    proposeExchangeDto: ProposeExchangeDto,
    userId: string,
  ) {
    // 교환 제안 로직
    // 수량은 1개로 고정
    // 자신의 카드를 정보 + 수량은 1개로 고정
    // 교환제시 내용 추가

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

    // 2. 제안하는 카드가 실제로 사용자의 소유인지 확인
    const offeredCard = await this.prisma.card.findFirst({
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

    // 3. 교환 요청 생성
    const exchange = await this.prisma.exchange.create({
      data: {
        requesterId: userId,
        offeredCardId: proposeExchangeDto.offeredCardId,
        targetCardId: shop.cardId,
        status: 'REQUESTED',
      },
      include: {
        offeredCard: true,
        requester: true,
        targetCard: true,
      },
    });

    // 4. 알림 생성
    await this.prisma.notification.create({
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
  }
}
