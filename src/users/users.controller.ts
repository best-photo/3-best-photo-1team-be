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
import { existsSync, mkdir, mkdirSync } from 'fs';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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
<<<<<<< HEAD
  @UseInterceptors(
    FileInterceptor('imageUrl', {
      dest: './uploads',
      limits: {
        fileSize: 5 * 1024 * 1024, //5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('지원하지 않는 파일 형식입니다'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  ) // 파일 저장 위치 설정
=======
  @UseInterceptors(FileInterceptor('imageUrl', { 
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = './uploads';
        // uploads 디렉토리가 없으면 생성
        if(!existsSync(uploadDir)){
          mkdirSync(uploadDir, {recursive : true});
        }
        cb(null, uploadDir);
      },
      filename: (req, file, callback) => {
        // 현재 시간을 파일 이름에 포함시켜 고유하게 만들기
        const timestamp = Date.now();
        //파일 확장자 보안 검사
        const fileExtension = extname(file.originalname).toLowerCase();
        if(!['.jpg', '.jpeg', '.png'].includes(fileExtension)){
          return callback(new BadRequestException('지원하지 않는 파일 형식입니다'), null);
        }
        const newFileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExtension}`; // timestamp + 확장자
        callback(null, newFileName); // 새로운 파일 이름 저장
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
>>>>>>> 231f79d001a3604399f24a3614baaef8278f05d7
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
    } catch (error) {
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (optional)',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (optional)',
    example: '10',
  })
  async getMyCards(
    @GetUser() user: { userId: string },
    @Query('search') search?: string, // Optional
    @Query('sortGrade') sortGrade?: CardGrade, // Prisma enum
    @Query('sortGenre') sortGenre?: CardGenre, // Prisma enum
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.usersService.getUserCards(
      user.userId,
      search || '',
      sortGrade || '',
      sortGenre || '',
      pageNum,
      limitNum,
    );
  }

  @Get('my-cards/:id')
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
    @Param('id') id: string,
    @GetUser() user: { userId: string },
  ) {
    return this.usersService.getCardById(id, user.userId);
  }
}
