import { ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { CardGenre, CardGrade } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  Max,
} from 'class-validator';

// 카드 정보 DTO
export class CardDto {
  @ApiProperty({
    nullable: false,
    description:
      '카드 ID (서버에서 CUID 형식으로 자동 생성되며, 클라이언트가 값을 제공할 필요 없음)',
    example: createId(),
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    nullable: false,
    description: '카드 소유자 ID',
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    nullable: false,
    description: '카드 이름 (최소 1자, 최대 50자 문자열)',
    example: '카드 이름',
    type: String,
  })
  @Length(1, 50)
  @IsString()
  name: string;

  @ApiProperty({
    nullable: false,
    description: '카드 가격 (0 이상, 10억원 이하)',
    example: 1000,
    type: Number,
  })
  @IsInt()
  @Min(0) // 가격 음수 방지
  @Max(1000000000) // 10억원 상한선 설정
  price: number;

  @ApiProperty({
    nullable: false,
    description: '카드 등급',
    example: CardGrade.COMMON,
    type: String,
  })
  @IsEnum(CardGrade)
  grade: CardGrade;

  @ApiProperty({
    nullable: false,
    description: '카드 장르',
    example: CardGenre.LANDSCAPE,
    type: String,
  })
  @IsEnum(CardGenre)
  genre: CardGenre;

  // 테이블에는 제한이 없지만 최대 200자로 제한 제공해봄
  @ApiProperty({
    nullable: false,
    description: '카드 설명 (선택사항, 최대 200자)',
    example: '카드 설명',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200) // 최대 200자 제한
  description?: string;

  // 카드의 총 발행량 0이면 카드가 의미 없다고 생각해서 최소 1로 설정 (0인 카드는 거래나 사용 불가능함)
  @ApiProperty({
    nullable: false,
    description: '카드 총 발행 수량 (1 이상)',
    example: 100,
    type: Number,
  })
  @IsInt()
  @Min(1) //  최소 발행 수량은 1
  totalQuantity: number;

  @ApiProperty({
    nullable: false,
    description: '카드 남은 수량 (0 이상, 총 발행량 이하)',
    example: 3,
    type: Number,
  })
  @IsInt()
  @Min(0) // 남은 수량은 0 이상
  @IsLessThanOrEqual('totalQuantity', {
    message: '남은 수량은 총 발행량을 초과할 수 없습니다',
  })
  remainingQuantity: number;

  // string 타입으로 해야할지 Date 타입으로 해야할지 고민이 많이 됨
  // 1. string
  // 2. Date
  // 3. 유효검사 없애기
  @ApiProperty({
    description: '카드 생성 날짜',
    example: '2024-12-31T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '카드 업데이트 날짜',
    example: '2024-12-31T12:00:00Z',
  })
  updatedAt: Date;
}

// 남은 수량이 총 발행량을 초과하지 않는지 확인하는 커스텀 유효성 검사 데코레이터
function IsLessThanOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLessThanOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value <= relatedValue
          );
        },
      },
    });
  };
}
