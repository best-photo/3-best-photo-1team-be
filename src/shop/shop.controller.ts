import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  async create(@Body() createShopDto: CreateShopDto) {
    try {
      const shopEntry = await this.shopService.create(createShopDto);
      return {
        message: '판매 등록이 완료되었습니다.',
        data: shopEntry,
      };
    } catch (error) {
      console.error('판매 등록 실패:', error);
      throw new Error('판매 등록 중 오류가 발생했습니다.');
    }
  }

  @Get('all')
  async findAllShops() {
    return await this.shopService.getAllShops();
  }

  @Get('successOrFail/:id')
  async getCardWithShop(@Param('id') cardId: string) {
    return this.shopService.getCardWithShop(cardId);
  }

  @Get('cards')
  async findAll(
    @Query('query') query?: string,
    @Query('grade') grade?: 'COMMON' | 'RARE' | 'superRare' | 'LEGENDARY',
    @Query('genre') genre?: 'TRAVEL' | 'LANDSCAPE' | 'PORTRAIT' | 'OBJECT',
    @Query('status') status?: 'IN_STOCK' | 'OUT_OF_STOCK',
    @Query('placeOrder')
    placeOrder?: '최신순' | '오래된 순' | '높은 가격순' | '낮은 가격순',
  ) {
    const filters = { query, grade, genre, status, placeOrder };

    return await this.shopService.findAll(filters);
  }

  @Get('/cards/:id')
  async findUserCards(
    @Param('id') userId: string,
    @Query('query') query?: string,
    @Query('grade') grade?: 'COMMON' | 'RARE' | 'SUPER_RARE' | 'LEGENDARY',
    @Query('genre') genre?: 'TRAVEL' | 'LANDSCAPE' | 'PORTRAIT' | 'OBJECT',
  ) {
    const filters = { query, grade, genre };
    console.log('Filters:', filters);
    return await this.shopService.findUserCards(userId, filters);
  }

  @Get('card/:userId/:cardId')
  async findCardByUserAndId(
    @Param('userId') userId: string,
    @Param('cardId') cardId: string,
  ) {
    const card = await this.shopService.findCardByUserAndId(userId, cardId);
    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다.');
    }
    return card;
  }

  // @Get('/user/:id')
  // async findUserCards(
  //   @Param('id') userId: string,
  //   @Query('query') query?: string,
  //   @Query('grade') grade?: 'COMMON' | 'RARE' | 'SUPER RARE' | 'LEGENDARY',
  //   @Query('genre') genre?: 'TRAVEL' | 'LANDSCAPE' | 'PORTRAIT' | 'OBJECT',
  // ) {
  //   const filters = { query, grade, genre };
  //   return await this.shopService.findUserCards(userId, filters);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(+id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopService.remove(+id);
  }
}
