import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class PurchaseCardDto {
  @ApiProperty({ description: '구매할 상점 ID' })
  @IsString()
  shopId: string;

  @ApiProperty({ description: '구매할 카드 수량', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class PurchaseResponseDto {
  @ApiProperty({ description: '구매 결과 메시지' })
  message: string;

  @ApiProperty({
    description: '구매 상세 정보',
    type: 'object',
    properties: {
      purchaseId: { type: 'string', description: '구매 ID' },
      cardName: { type: 'string', description: '카드 이름' },
      quantity: { type: 'number', description: '구매 수량' },
      totalPrice: { type: 'number', description: '총 구매 가격' },
      remainingPoints: { type: 'number', description: '구매 후 남은 포인트' },
    },
  })
  data: {
    purchaseId: string;
    cardName: string;
    quantity: number;
    totalPrice: number;
    remainingPoints: number;
  };
}
