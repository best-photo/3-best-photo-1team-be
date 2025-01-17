import { CardGrade, CardGenre } from '@prisma/client';

export class CreateShopDto {
  sellerId: string;
  cardId: string;
  price: number;
  quantity: number;
  exchangeGrade: CardGrade;
  exchangeGenre: CardGenre;
  exchangeDescription?: string;
}
