import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CardDto } from '../cards.dto';
import { createId } from '@paralleldrive/cuid2';
import { Exchange, Card } from '@prisma/client';

type ExchangeWithRelations = Exchange & {
  offeredCard: Card & {
    owner: {
      nickname: string;
    };
  };
};

export class GetMyExchangeCardResponseDto extends CardDto {
  @ApiProperty({
    nullable: false,
    description: '교환 대상 카드의 ID',
    example: createId(),
    type: String,
  })
  @IsString()
  targetId: string;

  @ApiProperty({
    nullable: false,
    default: 'nickname',
    description: '카드 소유자의 닉네임',
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    nullable: false,
    default: 'exchange',
    description: '카드의 판매 방법',
  })
  @IsString()
  state: 'exchange';

  static of(exchange: ExchangeWithRelations): GetMyExchangeCardResponseDto {
    const response = new GetMyExchangeCardResponseDto();
    response.targetId = exchange.targetCardId;
    response.id = exchange.offeredCard.id;
    response.ownerId = exchange.requesterId;
    response.name = exchange.offeredCard.name;
    response.description = exchange.offeredCard.description;
    response.grade = exchange.offeredCard.grade;
    response.genre = exchange.offeredCard.genre;
    response.totalQuantity = 1;
    response.price = exchange.offeredCard.price;
    response.createdAt = exchange.createdAt;
    response.updatedAt = exchange.updatedAt;
    response.nickname = exchange.offeredCard.owner.nickname;
    response.state = 'exchange';
    return response;
  }
}
