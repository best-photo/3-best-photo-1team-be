import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsInt, Max, Min } from 'class-validator';

export class PointDto {
  @ApiProperty({
    nullable: false,
    description: '포인트 ID (CUID 자동 생성)',
    example: createId(),
    type: String,
  })
  // 자동으로 생성되므로 String 타입 유효검사 필요 없음
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
    description: '포인트 잔액',
    example: 0,
    type: Number,
  })
  @IsInt()
  @Min(0, { message: '포인트 잔액은 0 이상이어야 합니다.' })
  @Max(1000000, { message: '포인트는 최대 1,000,000까지 보관할 수 있습니다.' })
  balance: number;
}

export class RandomPointResponseDto {
  @ApiProperty({
    nullable: false,
    description: '랜덤 포인트 값',
    example: 100,
    type: Number,
  })
  @IsInt()
  @Min(0, { message: '포인트 값은 0 이상이어야 합니다.' })
  @Max(1000, { message: '포인트는 최대 1,000까지 획득할 수 있습니다.' })
  point: number;
}
