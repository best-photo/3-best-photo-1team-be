import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsInt, Min } from 'class-validator';

export class ShopDTO {
  @ApiProperty({
    nullable: false,
    description: '상품 ID',
    example: createId(),
    type: String,
  })
  id: string;

  @ApiProperty({
    nullable: false,
    description: '판매자의 ID',
    example: createId(),
    type: String,
  })
  sellerId: string;

  @ApiProperty({
    nullable: false,
    description: '판매할 카드의 ID',
    example: createId(),
    type: String,
  })
  cardId: string;

  @ApiProperty({
    nullable: false,
    description: '상품 가격',
    example: 1000,
    type: Number,
  })
  @IsInt()
  @Min(0, { message: '상품 가격은 0 이상이어야 합니다.' })
  price: number;
}
