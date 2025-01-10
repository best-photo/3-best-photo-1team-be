import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsBoolean, IsString } from 'class-validator';

export class NotificationsDto {
  @ApiProperty({
    nullable: false,
    description: '알림 ID (CUID 자동 생성)',
    example: createId(),
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    nullable: false,
    description: '사용자 ID',
    example: '사용자 ID',
    type: String,
  })
  @IsString()
  userId: string;

  @ApiProperty({
    nullable: false,
    description: '알림 내용',
    example: '알림 내용',
    type: String,
  })
  @IsString()
  content: string;

  @ApiProperty({
    nullable: false,
    description: '알림 읽었는지 여부',
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  isRead: boolean;
}
