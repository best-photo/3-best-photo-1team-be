import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class ImageController {

  @Get(':imageName')
  async getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    // 절대 경로로 설정. process.cwd()는 현재 작업 디렉토리(프로젝트 루트)를 반환합니다.
    const imagePath = path.resolve(process.cwd(), 'uploads', imageName); // 경로 설정

    console.log('Requested Image Path:', imagePath); // 경로 확인

    // 파일이 존재하면 그 파일을 반환
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath); // 파일 보내기
    } else {
      return res.status(404).send('Image not found');
    }
  }
}
