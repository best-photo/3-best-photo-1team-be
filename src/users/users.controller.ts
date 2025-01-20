import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CheckEmailRequestDto, CheckNicknameRequestDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateCardDto } from 'src/cards/dto/create-card.dto';
import { CardGenre, CardGrade } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  GetMyCardsCountRequestDto,
  GetMyCardsRequestDto,
} from 'src/cards/dto/sellingCards/my-selling-card.dto';
import FilterServiceFactory from './services/filter-factory.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly filterServiceFactory: FilterServiceFactory,
  ) {}

  // 내 프로필 조회
  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiResponse({
    status: 200,
    description: '내 프로필 조회 성공',
  })
  @ApiResponse({
    status: 400,
    description: '내 프로필 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '내 프로필 조회 중 오류가 발생했습니다.',
  })
  async getProfile(@GetUser() user) {
    // 사용자 정보 조회
    // 쿠키에서 사용자 ID 가져오기
    // 사용자 정보가 없으면 NotFoundException 예외 발생
    // 사용자 정보가 있으면 사용자 정보 반환
    try {
      if (!user) {
        throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
      }
      const { userId } = user;
      return await this.usersService.getProfile(userId);
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
  @UseGuards(AuthGuard)
  @Post('check-email')
  @ApiResponse({
    status: 200,
    description: '이메일 중복 체크 성공',
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 이메일 형식입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 이메일입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '이메일 확인 중 오류가 발생했습니다.',
  })
  // 리소스가 생성되는 것이 아니라 중복 체크만 하는 것이므로
  // 기본 상태코드인 201 Created가 아닌 200 OK을 명시적으로 반환
  @HttpCode(200)
  async checkEmail(@Body() checkEmailRequestDto: CheckEmailRequestDto) {
    // 사용자 id 받기
    // 사용자 id가 없으면 BadRequestException 예외 발생
    // 사용자 id가 있으면 사용자 정보 반환
    // 응답으로 이메일이 존재하면 ConflictException 예외 발생
    // 존재하지 않으면 메시지 반환

    return await this.usersService.checkEmail(checkEmailRequestDto);
  }

  @Post('check-nickname')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: '닉네임 중복 체크 성공',
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 닉네임 형식입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 닉네임입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '닉네임 확인 중 오류가 발생했습니다.',
  })
  @UseGuards(AuthGuard)
  async checkNickname(
    @Body() checkNicknameRequestDto: CheckNicknameRequestDto,
  ) {
    // 응답으로 닉네임이 존재하면 ConflictException 예외 발생
    // 존재하지 않으면 메시지 반환
    return await this.usersService.checkNickname(checkNicknameRequestDto);
  }

  @Post('my-cards')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads';
          // uploads 디렉토리가 없으면 생성
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, callback) => {
          // 현재 시간을 파일 이름에 포함시켜 고유하게 만들기
          const timestamp = Date.now();
          //파일 확장자 보안 검사
          const fileExtension = extname(file.originalname).toLowerCase();
          if (!['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
            return callback(
              new BadRequestException('지원하지 않는 파일 형식입니다'),
              null,
            );
          }
          const newFileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`; // timestamp + 확장자
          callback(null, newFileName); // 새로운 파일 이름 저장
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({
    summary: '포토카드 생성',
    description: '새로운 포토카드를 생성하고 이미지를 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data') // 파일 업로드 지원
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'imageUrl',
        'name',
        'grade',
        'genre',
        'price',
        'totalQuantity',
        'description',
      ], // 필수 필드 설정
      properties: {
        imageUrl: {
          type: 'string',
          format: 'binary',
          description: '이미지 파일 (필수)',
        },
        name: { type: 'string', description: '카드 이름 (필수)' },
        grade: {
          type: 'string',
          enum: ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'],
          description: '카드 등급 (필수)',
        },
        genre: {
          type: 'string',
          enum: ['TRAVEL', 'LANDSCAPE', 'PORTRAIT', 'OBJECT'],
          description: '카드 장르 (필수)',
        },
        price: { type: 'integer', minimum: 1, description: '카드 가격 (필수)' },
        totalQuantity: {
          type: 'integer',
          minimum: 1,
          description: '총 수량 (필수)',
        },
        description: { type: 'string', description: '카드 설명 (필수)' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '포토카드 생성 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  async createCard(
    @UploadedFile() imageUrl: Express.Multer.File, // 업로드된 파일 객체
    @Body() createCardDto: CreateCardDto, // 나머지 폼 데이터
    @GetUser() user: { userId: string }, // 사용자 정보
  ) {
    // 이미지 파일 검증
    if (!imageUrl) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    try {
      // Multer에서 저장한 파일 경로 가져오기
      const imageUrlPath = imageUrl.path;

      // DTO에 이미지 URL 추가
      createCardDto.imageUrl = imageUrlPath;

      // 카드 생성 서비스 호출
      return this.usersService.createCard(user.userId, createCardDto);
    } catch {
      throw new InternalServerErrorException(
        '파일 업로드 중 오류가 발생했습니다.',
      );
    }
  }

  @Get('my-cards')
  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search keyword (optional)',
  })
  @ApiQuery({
    name: 'sortGrade',
    enum: CardGrade,
    required: false,
    description: 'Filter by card grade (optional)',
  })
  @ApiQuery({
    name: 'sortGenre',
    enum: CardGenre,
    required: false,
    description: 'Filter by card genre (optional)',
  })
  async getMyCards(
    @GetUser() user: { userId: string },
    @Query('search') search?: string, // Optional
    @Query('sortGrade') sortGrade?: CardGrade, // Prisma enum
    @Query('sortGenre') sortGenre?: CardGenre, // Prisma enum
  ) {
    return this.usersService.getUserCards(
      user.userId,
      search || '',
      sortGrade || '',
      sortGenre || '',
    );
  }

  @Get('my-cards/sales/count')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내 카드 수량 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '내 카드 조회 중 오류가 발생했습니다.',
  })
  @ApiQuery({
    name: 'filter',
    enum: ['grade', 'genre', 'salesMethod', 'stockState'],
    required: true,
    description: '필터 타입',
  })
  async getSellingCardsCount(
    @GetUser() user: { userId: string },
    @Query() params: GetMyCardsCountRequestDto,
  ) {
    try {
      const filterService = this.filterServiceFactory.getService(params.filter);
      return await filterService.execute(user.userId);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      throw new InternalServerErrorException(
        '판매 카드 조회 중 오류가 발생했습니다.',
      );
    }
  }

  @Get('my-cards/sales')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내 판매 카드 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 판매 카드 조회 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '판매 카드 조회 중 오류가 발생했습니다.',
  })
  async getMySellingCards(
    @GetUser() user: { userId: string },
    @Query() params: GetMyCardsRequestDto,
  ) {
    try {
      return await this.usersService.getMySellingCards(user.userId, params);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      throw new InternalServerErrorException(
        '판매 카드 조회 중 오류가 발생했습니다.',
      );
    }
  }

  @Get('my-cards/:userId/:cardId')
  @UseGuards(AuthGuard) // 인증된 사용자만 접근할 수 있도록
  @ApiOperation({
    summary: 'Get card details by card ID',
    description: "Fetch a card by its ID along with the owner's nickname",
  })
  @ApiResponse({
    status: 200,
    description: 'Card details fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found',
  })
  async getCardById(
    @Param('userId') userId: string, // userId 파라미터를 추가로 받음
    @Param('cardId') cardId: string, // cardId 파라미터를 추가로 받음
    @GetUser() user: { userId: string }, // 인증된 유저 정보
  ) {
    // 유저 아이디와 카드 아이디가 모두 받아졌으므로, 서비스로 전달하여 카드 정보를 조회합니다.
    return this.usersService.getCardById(cardId, userId); // userId와 cardId 모두 전달
  }

  @Get('card-info')
  @UseGuards(AuthGuard) // JWT 인증 가드 (필요한 경우)
  async getUserPhotoCardInfo(@GetUser() user: { userId: string }) {
    const { userId } = user;
    return this.usersService.getUserPhotoCardInfo(userId);
  }
}
