import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ProposeExchangeDto {
  @ApiProperty({
    description: '교환을 제안할 카드 ID',
    example: 'card_123456',
  })
  @IsString()
  @IsNotEmpty()
  offeredCardId: string;

  @ApiProperty({
    description: '교환 제안 내용',
    example: '이 카드와 교환하고 싶습니다.',
  })
  @IsString()
  @IsNotEmpty()
  exchangeDescription: string;
}
