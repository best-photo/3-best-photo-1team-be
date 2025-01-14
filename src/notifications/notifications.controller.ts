import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateNotificationDto,
  NotificationFilterDto,
  NotificationResponseDto,
  UpdateNotificationResponseDto,
} from './dto/notifications.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth() // 인증이 필요한 API임을 Swagger에 명시
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '알림 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  async getNotifications(
    @GetUser() user,
    @Query() filterDto: NotificationFilterDto,
  ): Promise<NotificationResponseDto> {
    const { userId } = user;
    return await this.notificationsService.findAll(userId, filterDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '알림 상태 수정' })
  @ApiResponse({
    status: 200,
    description: '알림 상태 수정 성공',
    type: UpdateNotificationResponseDto,
  })
  async updateNotification(
    @Param('id') notificationId: string,
  ): Promise<UpdateNotificationResponseDto> {
    return this.notificationsService.update(notificationId);
  }

  // 고민
  @UseGuards(AuthGuard)
  @Post('/test')
  @ApiOperation({ summary: '테스트용 알림 생성' })
  @ApiResponse({ status: 201, description: '알림 생성 성공' })
  // BAD REQUEST
  async createNotification(
    @GetUser() user,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const { userId } = user;
    const { content } = createNotificationDto;
    return this.notificationsService.create(userId, content);
  }
}
