import { PrismaService } from 'src/prisma/prisma.service';

export interface FilterResult {
  [key: string]: number;
}

export abstract class BaseFilterService {
  constructor(protected prisma: PrismaService) {}
  abstract execute(userId: string): Promise<FilterResult>;
}
