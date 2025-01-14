import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
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
}
