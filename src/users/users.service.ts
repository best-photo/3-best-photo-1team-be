import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckEmailRequestDto,
  CheckEmailResponseDto,
  CheckNicknameRequestDto,
  ProfileResponseDto,
} from './dto/user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCardDto } from 'src/cards/dto/create-card.dto';
import { CardGenre, CardGrade, Prisma, User } from '@prisma/client';
import {
  GetMyCardsRequestDto,
  GetMySellingCardResponseDto,
} from 'src/cards/dto/sellingCards/my-selling-card.dto';
import { GetMyExchangeCardResponseDto } from 'src/cards/dto/exchangeCards/my-exchange-card.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  // 내 프로필 조회
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    // async getProfile(userId: string): Promise<ProfileResponseDto> {
    // 1. 사용자 정보 조회
    // 1-1. 쿠키에서 사용자 ID 가져오기
    // 1-1. 사용자 정보가 없으면 NotFoundException 예외 발생
    // 1-2. 사용자 정보가 있으면 사용자 정보 반환
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { point: true },
      });
      if (!user) {
        throw new BadRequestException('내 프로필이 존재하지 않습니다.');
      }
      if (!user.point) {
        throw new BadRequestException('포인트 정보가 존재하지 않습니다.');
      }
      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        points: user.point.balance,
      };
    } catch (error) {
      // Prisma 관련 에러 처리
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      // 기타 예상치 못한 에러
      throw new InternalServerErrorException(
        '사용자 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  // 사용자 이메일 중복 체크
  async checkEmail(
    checkEmailRequestDto: CheckEmailRequestDto,
  ): Promise<CheckEmailResponseDto> {
    // 1. email 형식이 유효한지 확인 { message: '유효하지 않은 이메일 형식입니다.' }
    // 2. email이 DB에 이미 존재하는지 확인
    // 2-1. 존재하면 ConflictException 예외 발생 { message: '이미 사용 중인 이메일입니다.' }
    // 2-2. 존재하지 않으면 사용 가능 메시지 반환 { message: '사용 가능한 이메일입니다.' }

    // RFC 6531에 따른 이메일 정규식
    const emailRegex =
      /^(?<localPart>(?<dotString>[0-9a-z!#$%&'*+\-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+(\.[0-9a-z!#$%&'*+\-\/=?^_`\{|\}~\u{80}-\u{10FFFF}]+)*)|(?<quotedString>"([\x20-\x21\x23-\x5B\x5D-\x7E\u{80}-\u{10FFFF}]|\\[\x20-\x7E])*"))(?<!.{64,})@(?<domainOrAddressLiteral>(?<addressLiteral>\[((?<IPv4>\d{1,3}(\.\d{1,3}){3})|(?<IPv6Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){7})|(?<IPv6Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,5})?)|(?<IPv6v4Full>IPv6:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){5}:\d{1,3}(\.\d{1,3}){3})|(?<IPv6v4Comp>IPv6:([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3})?::([0-9a-f]{1,4}(:[0-9a-f]{1,4}){0,3}:)?\d{1,3}(\.\d{1,3}){3})|(?<generalAddressLiteral>[a-z0-9\-]*[[a-z0-9]:[\x21-\x5A\x5E-\x7E]+))\])|(?<Domain>(?!.{256,})(([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z\-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))(\.([0-9a-z\u{80}-\u{10FFFF}]([0-9a-z\-\u{80}-\u{10FFFF}]*[0-9a-z\u{80}-\u{10FFFF}])?))*))$/iu;

    if (!emailRegex.test(checkEmailRequestDto.email)) {
      throw new BadRequestException('유효하지 않은 이메일 형식입니다.');
    }

    try {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: checkEmailRequestDto.email },
      });
      if (emailExists) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
      return {
        message: '사용 가능한 이메일입니다.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      // Prisma 관련 에러 처리
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      // ConflictException은 그대로 전달
      if (error instanceof ConflictException) {
        throw error;
      }
      // 기타 예상치 못한 에러
      throw new InternalServerErrorException(
        '이메일 확인 중 오류가 발생했습니다.',
      );
    }
  }

  // 사용자 닉네임 중복 체크
  async checkNickname(checkNicknameRequestDto: CheckNicknameRequestDto) {
    // 1. nickname이 DB에 이미 존재하는지 확인
    // 1-1. 존재하면 ConflictException 예외 발생 { message: '이미 사용 중인 닉네임입니다.' }
    // 1-2. 존재하지 않으면 사용 가능 메시지 반환 { message: '사용 가능한 닉네임입니다.' }

    try {
      const nicknameExists = await this.prisma.user.findUnique({
        where: { nickname: checkNicknameRequestDto.nickname },
      });

      if (nicknameExists) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
      return {
        message: '사용 가능한 닉네임입니다.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      // Prisma 관련 에러 처리
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      // ConflictException은 그대로 전달
      if (error instanceof ConflictException) {
        throw error;
      }
      // 기타 예상치 못한 에러
      throw new InternalServerErrorException(
        '닉네임 확인 중 오류가 발생했습니다.',
      );
    }
  }

  async createCard(userId: string, createCardDto: CreateCardDto) {
    const { name, grade, genre, price, totalQuantity, description, imageUrl } =
      createCardDto;

    // 총 수량 검증
    if (totalQuantity <= 0) {
      throw new BadRequestException('총 수량은 0보다 커야 합니다.');
    }

    // 가격 검증
    if (price < 0) {
      throw new BadRequestException('가격은 0 이상이어야 합니다.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Prisma로 전달하기 전에 값을 숫자로 변환
        const newCard = await tx.card.create({
          data: {
            ownerId: userId,
            name,
            grade,
            genre,
            price: Number(price), // 문자열을 숫자로 변환
            totalQuantity: Number(totalQuantity), // 문자열을 숫자로 변환
            remainingQuantity: Number(totalQuantity), // 초기 값은 총 수량과 동일
            imageUrl, // 이미지 URL 저장
            description,
          },
        });

        return newCard;
      });
    } catch (error) {
      console.error('Database error:', error); // DB 오류 로그 출력
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 작업 중 오류가 발생했습니다.',
        );
      }
      throw new InternalServerErrorException(
        '포토카드 생성 중 오류가 발생했습니다.',
      );
    }
  }

  async getUserCards(
    userId: string,
    search: string = '',
    sortGrade: CardGrade | '' = '',
    sortGenre: CardGenre | '' = '',
  ) {
    const where: Prisma.CardWhereInput = {
      ownerId: userId,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(sortGrade && { grade: sortGrade }),
      ...(sortGenre && { genre: sortGenre }),
    };

    console.log('WHERE CONDITIONS:', where); // 조건 확인

    const cards = await this.prisma.card.findMany({
      where,
      include: {
        owner: {
          select: {
            nickname: true,
          },
        },
      },
    });

    // 카드를 반환하면서, `nickname`을 각 카드에 포함시켜줍니다
    const cardsWithNickname = cards.map((card) => ({
      ...card,
      nickname: card.owner?.nickname, // 'nickname'을 카드 데이터에 추가
    }));

    return {
      cards: cardsWithNickname,
    };
  }

  async getCardById(cardId: string, userId: string) {
    // 해당 카드와 그 카드의 소유자 정보를 함께 가져옴
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        owner: {
          // 'owner' 필드를 포함시켜서 User 테이블에서 nickname을 가져옵니다
          select: {
            nickname: true, // 'nickname'만 선택하여 불러옵니다
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다');
    }

    if (card.ownerId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 카드 정보와 소유자 닉네임을 포함하여 반환
    return {
      ...card,
      nickname: card.owner?.nickname,
    };
  }

  async getUserPhotoCardInfo(userId: string) {
    // 사용자 정보를 가져오기 (닉네임 포함)
    const user: User | null = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자가 가진 모든 카드 조회
    const cards = await this.prisma.card.findMany({
      where: { ownerId: userId },
    });

    // 각 등급별 카운트 초기화
    let common = 0;
    let rare = 0;
    let superRare = 0;
    let legendary = 0;

    // 카드의 등급별 개수 계산
    cards.forEach((card) => {
      switch (card.grade.toUpperCase()) {
        case 'COMMON':
          common++;
          break;
        case 'RARE':
          rare++;
          break;
        case 'SUPER_RARE':
          superRare++;
          break;
        case 'LEGENDARY':
          legendary++;
          break;
        default:
          // 등급이 없는 경우 처리할 수 있습니다 (선택적)
          console.log(`Unknown grade for card: ${card.grade}`);
          break;
      }
    });

    // 반환할 데이터 객체 생성
    return {
      nickname: user.nickname, // 사용자 닉네임 반환
      common,
      rare,
      superRare,
      legendary,
    };
  }

  async getMySellingCards(userId: string, params: GetMyCardsRequestDto) {
    const { grade, genre, stockState, salesMethod, keyword } = params;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 30;
    const skip = (page - 1) * limit;

    const cardWhere = {
      ...(grade && { grade }),
      ...(genre && { genre }),
      ...(stockState && {
        remainingQuantity:
          stockState === 'IN_STOCK' ? { gt: 0 } : { equals: 0 },
      }),
      ...(keyword && {
        OR: [
          { name: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      }),
    };

    let sellingCards = [];
    let exchangeCards = [];
    let shopTotal = 0;
    let exchangeTotal = 0;

    if (!salesMethod || salesMethod === 'SALE') {
      const shopWhere = {
        sellerId: userId,
        ...(stockState && {
          remainingQuantity:
            stockState === 'IN_STOCK' ? { gt: 0 } : { equals: 0 },
        }),
        card: {
          ...(grade && { grade }),
          ...(genre && { genre }),
          ...(keyword && {
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          }),
        },
      };

      [sellingCards, shopTotal] = await Promise.all([
        this.prisma.shop.findMany({
          where: {
            ...shopWhere,
          },
          select: {
            id: true,
            price: true,
            initialQuantity: true,
            remainingQuantity: true,
            sellerId: true,
            createdAt: true,
            updatedAt: true,
            card: {
              select: {
                id: true,
                name: true,
                description: true,
                grade: true,
                genre: true,
                imageUrl: true,
                owner: {
                  select: {
                    nickname: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.shop.count({
          where: {
            sellerId: userId,
            card: cardWhere,
          },
        }),
      ]);
    }

    if (!salesMethod || salesMethod === 'EXCHANGE') {
      [exchangeCards, exchangeTotal] = await Promise.all([
        this.prisma.exchange.findMany({
          where: {
            requesterId: userId,
            offeredCard: cardWhere,
          },
          select: {
            id: true,
            targetCardId: true,
            createdAt: true,
            updatedAt: true,
            offeredCard: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                grade: true,
                genre: true,
                imageUrl: true,
                owner: {
                  select: {
                    nickname: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.exchange.count({
          where: {
            requesterId: userId,
          },
        }),
      ]);
    }

    const allCards = [...sellingCards, ...exchangeCards]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    const total = shopTotal + exchangeTotal;

    return {
      items: allCards.map((card) =>
        'price' in card
          ? GetMySellingCardResponseDto.of(card)
          : GetMyExchangeCardResponseDto.of(card),
      ),
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }
}
