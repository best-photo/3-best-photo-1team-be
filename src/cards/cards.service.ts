import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
