import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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

// 알림 생성 DTO
export class CreateNotificationDto {
  @ApiProperty({
    nullable: false,
    description: '알림내용',
    example: '새로운 교환 제안이 있습니다.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

// 알림 수정 DTO
export class UpdateNotificationDto {
  @ApiProperty({
    nullable: false,
    description: '읽음 상태',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}

// 필터링용 DTO
export class NotificationFilterDto {
  @ApiProperty({
    description: '페이지 번호',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiProperty({
    description: '페이지 당 항목 수',
    example: '10',
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string = '10';
}

// 페이지네이션 메타데이터 DTO
export class PaginationMetadataDto {
  @ApiProperty({
    description: '전체 알림 수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지 당 항목 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;
}

// 알림 목록 응답 DTO
export class NotificationResponseDto {
  @ApiProperty({
    description: '알림 목록',
    type: [NotificationDto],
  })
  notifications: NotificationDto[];

  @ApiProperty({
    description: '페이지네이션 메타데이터',
    type: PaginationMetadataDto,
  })
  metadata: PaginationMetadataDto;
}

// 알림 수정 응답 DTO
export class UpdateNotificationResponseDto {
  @ApiProperty({
    description: '알림 ID',
    example: 'exampleID',
  })
  id: string;

  @ApiProperty({
    description: '수정된 읽음 상태',
    example: true,
  })
  isRead: boolean;

  @ApiProperty({
    description: '수정된 날짜',
    example: '2025-01-14T12:34:56.789Z',
  })
  updatedAt: Date;
}
