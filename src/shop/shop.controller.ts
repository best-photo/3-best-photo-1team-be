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
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
import { PurchaseCardDto } from './dto/purchase-card.dto';
import { CardGenre, CardGrade } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';

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
            grade: CardGrade.LEGENDARY,
            genre: CardGenre.TRAVEL,
            owner: 'coolNickname',
            description: 'This is a legendary travel card!',
          },
          shop: {
            price: 1000,
            initialQuantity: 10,
            remainingQuantity: 5,
            exchangeInfo: {
              grade: CardGrade.RARE,
              genre: CardGenre.PORTRAIT,
              description: 'Looking to trade for portrait cards of rare grade',
            },
          },
        },
      },
    },
  })
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

  @UseGuards(AuthGuard)
  @Get(':id')
  async getShopDetails(@Param('id') shopId: string, @GetUser() user) {
    const { userId } = user;
    return this.shopService.getShopDetails(shopId, userId);
  }
  @ApiOperation({ summary: '판매 포토 카드 정보 수정' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '판매 포토 카드 정보 수정',
  })
  @ApiResponse({
    status: 200,
    description: '판매 포토 카드 정보 수정 성공',
    type: ShopDetailsResponse,
  })
  @ApiResponse({
    status: 404,
    description: '판매 카드 찾을 수 없음',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }

  @ApiOperation({ summary: '판매 포토 카드 정보 내리지/삭제' })
  @ApiParam({
    name: 'id',
    required: true,
    description: '판매 포토 카드 내리기/삭제',
  })
  @ApiResponse({
    status: 200,
    description: '판매 포토 카드 내리기/삭제 성공',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: '판매 포토 카드가 삭제되었습니다.',
        },
      },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopService.remove(id);
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

  // 판매 포토 카드 구매
  @ApiOperation({ summary: '포토 카드 구매' })
  @ApiResponse({
    status: 201,
    description: '포토 카드 구매 성공',
    type: PurchaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잔액 부족 또는 재고 부족',
  })
  @UseGuards(AuthGuard)
  @Post('purchase')
  async purchaseCard(
    @Body() purchaseCardDto: PurchaseCardDto,
    @GetUser() user,
  ) {
    const { userId } = user;
    console.log('User ID:', userId);
    console.log('Purchase DTO:', purchaseCardDto);
    try {
      return this.shopService.purchaseCard(userId, purchaseCardDto);
    } catch (error) {
      if (error) {
        throw new BadRequestException({
          message: '잔액이 부족합니다.',
          currentBalance: error.currentBalance,
          requiredAmount: error.requiredAmount,
        });
      }
      if (error) {
        throw new BadRequestException({
          message: '재고가 부족합니다.',
          requestedQuantity: error.requestedQuantity,
          availableQuantity: error.availableQuantity,
        });
      }
      throw new InternalServerErrorException(
        '구매 처리 중 오류가 발생했습니다.',
      );
    }
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

  @Get('filters/:category')
  async getFilterCountsByCategory(@Param('category') category: string) {
    console.log(category);
    return this.shopService.getFilterCountsByCategory(category);
  }

  @Get('filters/:userId/:category')
  async getFilterCountsByCategoryAndUser(
    @Param('userId') userId: string,
    @Param('category') category: string,
  ) {
    console.log(`User ID: ${userId}, Category: ${category}`);
    return this.shopService.getFilterCountsByCategoryAndUser(category, userId);
  }
}
