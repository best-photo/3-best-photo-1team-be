import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CheckEmailRequestDto, CheckNicknameRequestDto } from './dto/user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { CreateCardDto } from 'src/cards/dto/create-card.dto';
import { CardGenre, CardGrade } from '@prisma/client';

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
    @Body() createCardDto: CreateCardDto,
    @GetUser() user: { userId: string }, // GetUser 데코레이터로 유저 정보 가져오기
  ) {
    try{
      return this.usersService.createCard(user.userId, createCardDto);
    }catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 작업 중 오류가 발생했습니다.'
        );
      }
      throw new InternalServerErrorException(
        '포토카드 생성 중 오류가 발생했습니다.',
      );
    }
  }

  @Get('my-cards')
  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'search', required: false, description: 'Search keyword (optional)' })
  @ApiQuery({ name: 'sortGrade', enum: CardGrade, required: false, description: 'Filter by card grade (optional)' })
  @ApiQuery({ name: 'sortGenre', enum: CardGenre, required: false, description: 'Filter by card genre (optional)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (optional)', example: '1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (optional)', example: '10' })
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
}
