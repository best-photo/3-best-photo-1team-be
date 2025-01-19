import { ApiProperty } from '@nestjs/swagger';
import { Card, CardGenre, CardGrade, Shop } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CardDto } from '../cards.dto';
import { createId } from '@paralleldrive/cuid2';

type SellingCardWithRelations = Shop & {
  card: Card & {
    owner: {
      nickname: string;
    };
  };
};

export class GetMyCardsRequestDto {
  @ApiProperty({
    required: false,
    enum: CardGrade,
    description: '카드 등급으로 필터링(optional)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.genre && !o.stockState && !o.keyword)
  @IsEnum(CardGrade)
  grade?: CardGrade;

  @ApiProperty({
    required: false,
    enum: CardGenre,
    description: '카드 장르로 필터링(optional)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.grade && !o.stockState && !o.keyword)
  @IsEnum(CardGenre)
  genre?: CardGenre;

  @ApiProperty({
    required: false,
    enum: ['IN_STOCK', 'OUT_OF_STOCK'],
    description: '판매 상태로 필터링(optional)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.genre && !o.grade && !o.keyword)
  @IsEnum(['IN_STOCK', 'OUT_OF_STOCK'])
  stockState?: string;

  @ApiProperty({
    required: false,
    enum: ['EXCHANGE', 'SALE'],
    description: '판매 방법으로 필터링(optional)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.genre && !o.grade && !o.keyword)
  @IsEnum(['EXCHANGE', 'SALE'])
  salesMethod?: string;

  @ApiProperty({
    required: false,
    description: '검색 키워드 (카드 이름, 설명에서 검색) (optional)',
  })
  @IsOptional()
  @ValidateIf((o) => !o.genre && !o.stockState && !o.grade)
  @IsString()
  keyword?: string;

  @ApiProperty({
    required: false,
    default: 1,
    description: '페이지 번호 (1부터 시작)(optional)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 30,
    description: '페이지당 항목 수(optional)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 30;
}

enum Filter {
  grade = 'grade',
  genre = 'genre',
  salesMethod = 'salesMethod',
  stockState = 'stockState',
}

export class GetMyCardsCountRequestDto {
  @ApiProperty({
    required: true,
    enum: Filter,
    description: '조회할 필터링 기준',
  })
  @IsEnum(Filter)
  filter: Filter;
}

export class GetMySellingCardResponseDto extends CardDto {
  @ApiProperty({
    nullable: false,
    description:
      '판매 ID (서버에서 CUID 형식으로 자동 생성되며, 클라이언트가 값을 제공할 필요 없음)',
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
    default: 'sale',
    description: '카드의 판매 방법',
  })
  @IsString()
  state: 'sale';

  static of(shop: SellingCardWithRelations): GetMySellingCardResponseDto {
    const response = new GetMySellingCardResponseDto();
    response.targetId = shop.id;
    response.id = shop.card.id;
    response.ownerId = shop.sellerId;
    response.nickname = shop.card.owner.nickname;
    response.name = shop.card.name;
    response.description = shop.card.description;
    response.grade = shop.card.grade;
    response.genre = shop.card.genre;
    response.price = shop.price;
    response.totalQuantity = shop.quantity;
    response.createdAt = shop.createdAt;
    response.updatedAt = shop.updatedAt;
    response.state = 'sale';
    return response;
  }
}
