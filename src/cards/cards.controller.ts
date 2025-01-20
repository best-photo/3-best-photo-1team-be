import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProposeExchangeDto } from './dto/propose-exchange-card.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

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

  @ApiOperation({ summary: '포토카드 교환 제안' })
  @ApiResponse({
    status: 201,
    description: '교환 제안 성공',
  })
  @UseGuards(AuthGuard)
  @Post(':shopId/exchange')
  async proposePhotoCardExchange(
    @Param('shopId') shopId: string,
    @Body() proposeExchangeDto: ProposeExchangeDto,
    @GetUser() user,
  ) {
    const { userId } = user;
    return this.cardsService.proposePhotoCardExchange(
      shopId,
      proposeExchangeDto,
      userId,
    );
  }

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
}
