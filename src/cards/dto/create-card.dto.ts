import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { CardGrade, CardGenre } from '@prisma/client';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CardGrade)
  grade: CardGrade;

  @IsEnum(CardGenre)
  genre: CardGenre;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  totalQuantity: number;

  @IsString()
  description: string;

  @IsString()
  imageUrl: string; // 이미지 URL을 선택적으로 받음
}