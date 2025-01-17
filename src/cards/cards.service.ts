import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { Card } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService) {}

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

  async getUserPhotoCardInfo(userId: string) {
    // 사용자 정보를 가져오기 (닉네임 포함)
    const user: User | null = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 사용자가 가진 모든 카드 조회
    const cards: Card[] = await this.prisma.card.findMany({
      where: { ownerId: userId },
    });

    // 각 등급별 카운트 초기화
    let common = 0;
    let rare = 0;
    let superRare = 0;
    let legendary = 0;

    // 카드의 등급별 개수 계산
    cards.forEach((card) => {
      switch (card.grade.toUpperCase()) {
        case 'COMMON':
          common++;
          break;
        case 'RARE':
          rare++;
          break;
        case 'SUPER_RARE':
          superRare++;
          break;
        case 'LEGENDARY':
          legendary++;
          break;
      }
    });

    // 반환할 데이터 객체 생성
    return {
      nickname: user.nickname, // 사용자 닉네임 반환
      common,
      rare,
      superRare,
      legendary,
    };
  }
}
