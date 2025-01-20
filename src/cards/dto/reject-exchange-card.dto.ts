import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectExchangeCardDto {
  @ApiProperty({
    description: '교환 제안 ID',
    example: 'exchange_123456',
  })
  @IsString()
  @IsNotEmpty()
  exchangeId: string;
}
