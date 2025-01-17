import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];

@Controller('uploads')
export class ImageController {

  @Get(':imageName')
  async getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    // 경로 주입 방지를 위한 검증
    const VALID_IMAGE_REGEX = /^[a-zA-Z0-9-_]+\.(jpg|jpeg|png)$/;
    if (!VALID_IMAGE_REGEX.test(imageName)) {
      return res.status(400).send('Invalid image name');
    }
    const imagePath = path.resolve(process.cwd(), 'uploads', imageName); // 경로 설정
    const mimeType = mime.lookup(imagePath);

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)){
      return res.status(400).send('Invalid file type');
    }

    console.log('Requested Image Path:', imagePath); // 경로 확인

    try {
      await fs.promises.access(imagePath);
      return res.sendFile(imagePath);
    } catch(error){
      return res.status(404).send('Image not found');
    }
  }
}
