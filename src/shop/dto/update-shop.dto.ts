import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { CardGenre, CardGrade } from '@prisma/client';
// import { PartialType } from '@nestjs/mapped-types';
// import { CreateShopDto } from './create-shop.dto';
// export class UpdateShopDto extends PartialType(CreateShopDto) {}

export class UpdateShopDto {
  @ApiPropertyOptional({ description: '판매 가격', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: '판매 초기 수량', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialQuantity?: number;

  @ApiPropertyOptional({ description: '판매 남은 수량', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @ValidateIf(
    (o) => o.remainingQuantity !== undefined && o.initialQuantity !== undefined,
  )
  remainingQuantity?: number;

  @ApiPropertyOptional({
    enum: CardGrade,
    description: '교환 희망 등급',
  })
  @IsOptional()
  @IsEnum(CardGrade)
  exchangeGrade?: CardGrade;

  @ApiPropertyOptional({
    enum: CardGenre,
    description: '교환 희망 장르',
  })
  @IsOptional()
  @IsEnum(CardGenre)
  exchangeGenre?: CardGenre;

  @ApiPropertyOptional({ description: '교환 희망 설명' })
  @IsOptional()
  @IsString()
  exchangeDescription?: string;
}
