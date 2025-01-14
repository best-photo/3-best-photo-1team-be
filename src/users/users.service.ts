import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CheckEmailRequestDto,
  CheckEmailResponseDto,
  CheckNicknameRequestDto,
  ProfileResponseDto,
} from './dto/user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CardGenre, CardGrade, Prisma } from '@prisma/client';
import { CreateCardDto } from 'src/cards/dto/create-card.dto';

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
    const { name, grade, genre, price, totalQuantity, description } = createCardDto;

    const newCard = await this.prisma.card.create({
      data: {
        ownerId: userId, // 로그인한 유저의 ID를 카드 소유자로 설정
        name,
        grade,
        genre,
        price,
        totalQuantity,
        remainingQuantity: totalQuantity, // 남은 수량 초기화
        description,
      },
    });

    return newCard;
  }
}
