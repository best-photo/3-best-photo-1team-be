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
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShopDetailsResponse } from './dto/shop.dto';

@ApiTags('Shop')
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

  @ApiParam({
    name: 'id',
    required: true,
    description: '판매 포토 카드 상세 조회',
  })
  @ApiOperation({ summary: '판매 포토 카드 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: ShopDetailsResponse,
  })
  @ApiOkResponse({
    description: '판매 포토 카드 상세 조회 성공',
    type: ShopDetailsResponse,
    examples: {
      example1: {
        summary: '정상적인 응답 예시',
        value: {
          card: {
            name: 'Legendary Card',
            imageUrl: 'https://example.com/card-image.png',
            grade: 'LEGENDARY',
            genre: 'TRAVEL',
            owner: 'coolNickname',
            description: 'This is a legendary travel card!',
          },
          shop: {
            price: 1000,
            totalQuantity: 10,
            remainingQuantity: 5,
            exchangeInfo: {
              grade: 'RARE',
              genre: 'PORTRAIT',
              description: 'Looking to trade for portrait cards of rare grade',
            },
          },
        },
      },
    },
  })
  @Get(':id')
  async getShopDetails(@Param('id') shopId: string) {
    return this.shopService.getShopDetails(shopId);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(+id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopService.remove(+id);
  }
}
