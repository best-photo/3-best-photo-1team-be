import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }

  @Get('cards')
  async findAll(
    @Query('query') query?: string,
    @Query('grade') grade?: 'COMMON' | 'RARE' | 'SUPER_RARE' | 'LEGENDARY',
    @Query('genre') genre?: 'TRAVEL' | 'LANDSCAPE' | 'PORTRAIT' | 'OBJECT',
    @Query('status') status?: '판매 중' | '판매 완료',
    @Query('priceOrder')
    priceOrder?: '최신순' | '오래된 순' | '높은 가격순' | '낮은 가격순',
  ) {
    const filters = { query, grade, genre, status, priceOrder };
    return await this.shopService.findAll(filters);
  }

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
