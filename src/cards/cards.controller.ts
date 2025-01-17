import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }

  @Get('public-cards/:id')
  @ApiOperation({
    summary: 'Get card details by card ID without authentication',
    description: 'Fetch a card by its ID without requiring authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Card details fetched successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found.',
  })
  async getCardByIdWithoutAuth(@Param('id') id: string) {
    return this.cardsService.getCardByIdWithoutAuth(id);
  }
}
