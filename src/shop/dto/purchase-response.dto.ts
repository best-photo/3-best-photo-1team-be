import { ApiProperty } from '@nestjs/swagger';

export class PurchaseResponseDto {
  @ApiProperty({ example: '구매가 완료되었습니다.' })
  message: string;

  @ApiProperty({
    example: {
      purchaseId: 'cju0zv...',
      cardName: '카드 이름',
      quantity: 1,
      totalPrice: 1000,
      remainingPoints: 4000,
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
