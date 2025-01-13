import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationFilterDto } from './dto/notifications.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth() // 인증이 필요한 API임을 Swagger에 명시
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '알림 목록 조회' })
  @ApiResponse({ status: 200, description: '알림 목록 조회 성공' })
  async getNotifications(
    @GetUser() user,
    @Query() filterDto: NotificationFilterDto,
  ) {
    const { userId } = user;
    return await this.notificationsService.findAll(userId, filterDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '알림 상태 수정' })
  @ApiResponse({ status: 200, description: '알림 상태 수정 성공' })
  async updateNotification(@Param('id') notificationId: string) {
    return this.notificationsService.update(notificationId);
  }
}
