import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsBoolean, IsString, Length } from 'class-validator';

export class NotificationDto {
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
    example: createId(),
    type: String,
  })
  userId: string;

  @ApiProperty({
    nullable: false,
    description: '알림 내용',
    example: '알림 내용',
    type: String,
  })
  @IsString()
  // 이게 필요한지 의문
  @Length(1, 500, {
    message: '알림 내용은 1자 이상 500자 이하여야 합니다',
  })
  content: string;

  @ApiProperty({
    nullable: false,
    description: '알림 읽었는지 여부',
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  isRead: boolean = false; // 기본값은 false
}
