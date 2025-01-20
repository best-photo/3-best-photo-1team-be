import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProposeExchangeDto } from './dto/propose-exchange-card.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { RejectExchangeCardDto } from './dto/reject-exchange-card.dto';
import { AcceptExchangeCardDto } from './dto/accept-exchange-card.dto';
import { CancelExchangeCardDto } from './dto/cancel-exchange-card.dto';

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

  @ApiOperation({ summary: '포토카드 교환 수락' })
  @ApiResponse({
    status: 200,
    description: '교환 성공',
  })
  @ApiResponse({
    status: 404,
    description: '교환 제안을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '교환 제안을 수락할 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '교환 제안이 이미 수락되었음',
  })
  @ApiResponse({
    status: 400,
    description: '자신의 카드를 교환 제안할 수 없음',
  })
  @UseGuards(AuthGuard)
  @Post(':shopId/exchange/accept')
  async acceptPhotoCardExchange(
    @Param('shopId') shopId: string,
    @Body() acceptExchangeCardDto: AcceptExchangeCardDto,
    @GetUser() user,
  ) {
    const { userId } = user;
    return this.cardsService.acceptPhotoCardExchange(
      shopId,
      acceptExchangeCardDto,
      userId,
    );
  }

  @ApiOperation({ summary: '포토카드 교환 거절' })
  @ApiResponse({
    status: 200,
    description: '교환 거절 성공',
  })
  @ApiResponse({
    status: 404,
    description: '교환 제안을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '교환 제안을 거절할 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '교환 제안이 이미 거절되었음',
  })
  @ApiResponse({
    status: 400,
    description: '자신의 카드를 교환 제안할 수 없음',
  })
  @UseGuards(AuthGuard)
  @Post(':shopId/exchange/reject')
  async rejectPhotoCardExchange(
    @Param('shopId') shopId: string,
    @Body() rejectExchangeCardDto: RejectExchangeCardDto,
    @GetUser() user,
  ) {
    const { userId } = user;
    return this.cardsService.rejectPhotoCardExchange(
      shopId,
      rejectExchangeCardDto,
      userId,
    );
  }

  @ApiOperation({ summary: '포토카드 교환 제안 취소' })
  @ApiResponse({
    status: 200,
    description: '교환 제안 취소 성공',
  })
  @ApiResponse({
    status: 404,
    description: '교환 제안을 찾을 수 없음',
  })
  @ApiResponse({
    status: 403,
    description: '교환 제안을 취소할 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '교환 제안이 이미 수락되었음',
  })
  @UseGuards(AuthGuard)
  @Post(':shopId/exchange/cancel')
  async cancelPhotoCardExchange(
    @Param('shopId') shopId: string,
    @Body() cancelExchangeCardDto: CancelExchangeCardDto,
    @GetUser() user,
  ) {
    const { userId } = user;
    return this.cardsService.cancelPhotoCardExchange(
      shopId,
      cancelExchangeCardDto,
      userId,
    );
  }
}
