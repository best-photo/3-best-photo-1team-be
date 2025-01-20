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
