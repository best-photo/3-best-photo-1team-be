import { PrismaClient, CardGrade, CardGenre } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();

async function main() {
  // DB 초기화
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.exchange.deleteMany();
  await prisma.card.deleteMany();

  const hashedPassword = await argon2.hash('qwer1!2@');

  const user1 = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: hashedPassword,
      nickname: 'test1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'test2@naver.com',
      password: hashedPassword,
      nickname: 'test2',
    },
  });

  // 카드 데이터 생성
  const cards = await Promise.all([
    // TRAVEL 카드들
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '마추픽추의 일출',
        price: 2000,
        grade: CardGrade.LEGENDARY,
        genre: CardGenre.TRAVEL,
        description: '페루 마추픽추에서 촬영한 장엄한 일출 장면',
        totalQuantity: 50,
        remainingQuantity: 30,
        imageUrl: 'https://example.com/machupicchu.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '산토리니 절벽마을',
        price: 1500,
        grade: CardGrade.SUPER_RARE,
        genre: CardGenre.TRAVEL,
        description: '그리스 산토리니의 아름다운 절벽마을 전경',
        totalQuantity: 100,
        remainingQuantity: 75,
        imageUrl: 'https://example.com/santorini.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '베니스 곤돌라',
        price: 800,
        grade: CardGrade.RARE,
        genre: CardGenre.TRAVEL,
        description: '이탈리아 베니스의 전통 곤돌라',
        totalQuantity: 200,
        remainingQuantity: 150,
        imageUrl: 'https://example.com/venice.jpg',
      },
    }),

    // LANDSCAPE 카드들
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '그랜드캐니언 파노라마',
        price: 2500,
        grade: CardGrade.LEGENDARY,
        genre: CardGenre.LANDSCAPE,
        description: '미국 그랜드캐니언의 장대한 파노라마 뷰',
        totalQuantity: 50,
        remainingQuantity: 20,
        imageUrl: 'https://example.com/grandcanyon.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '알프스 설산',
        price: 1200,
        grade: CardGrade.SUPER_RARE,
        genre: CardGenre.LANDSCAPE,
        description: '스위스 알프스의 눈 덮인 산맥',
        totalQuantity: 100,
        remainingQuantity: 60,
        imageUrl: 'https://example.com/alps.jpg',
      },
    }),

    // PORTRAIT 카드들
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '몽마르트의 화가',
        price: 1800,
        grade: CardGrade.SUPER_RARE,
        genre: CardGenre.PORTRAIT,
        description: '파리 몽마르트의 거리 화가',
        totalQuantity: 80,
        remainingQuantity: 40,
        imageUrl: 'https://example.com/montmartre.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '티베트 승려',
        price: 1000,
        grade: CardGrade.RARE,
        genre: CardGenre.PORTRAIT,
        description: '티베트 사원의 수행 승려',
        totalQuantity: 150,
        remainingQuantity: 100,
        imageUrl: 'https://example.com/monk.jpg',
      },
    }),

    // OBJECT 카드들
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '앤틱 타자기',
        price: 1600,
        grade: CardGrade.SUPER_RARE,
        genre: CardGenre.OBJECT,
        description: '1920년대 빈티지 타자기',
        totalQuantity: 70,
        remainingQuantity: 35,
        imageUrl: 'https://example.com/typewriter.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user1.id,
        name: '모로칸 램프',
        price: 600,
        grade: CardGrade.COMMON,
        genre: CardGenre.OBJECT,
        description: '모로코 전통 양식의 장식용 램프',
        totalQuantity: 300,
        remainingQuantity: 250,
        imageUrl: 'https://example.com/lamp.jpg',
      },
    }),
  ]);

  // 일부 카드를 상점에 등록
  await Promise.all([
    prisma.shop.create({
      data: {
        sellerId: user1.id,
        cardId: cards[0].id, // 마추픽추 카드
        price: 2500,
        initialQuantity: 10,
        exchangeGrade: 'SUPER_RARE',
        exchangeGenre: 'LANDSCAPE',
        exchangeDescription: '설명',
      },
    }),
    prisma.shop.create({
      data: {
        sellerId: user1.id,
        cardId: cards[3].id, // 그랜드캐니언 카드
        price: 3000,
        initialQuantity: 5,
        exchangeGrade: 'SUPER_RARE',
        exchangeGenre: 'LANDSCAPE',
        exchangeDescription: '설명',
      },
    }),
    prisma.shop.create({
      data: {
        sellerId: user1.id,
        cardId: cards[5].id, // 몽마르트 화가 카드
        price: 2200,
        initialQuantity: 3,
        exchangeGrade: 'SUPER_RARE',
        exchangeGenre: 'LANDSCAPE',
        exchangeDescription: '설명',
      },
    }),
    prisma.shop.create({
      data: {
        sellerId: user1.id,
        cardId: cards[8].id, // 앤틱 타자기 카드
        price: 2000,
        initialQuantity: 2,
        exchangeGrade: 'SUPER_RARE',
        exchangeGenre: 'LANDSCAPE',
        exchangeDescription: '설명',
      },
    }),
  ]);

  const user2Cards = await Promise.all([
    prisma.card.create({
      data: {
        ownerId: user2.id, // 두 번째 사용자 ID
        name: '오로라',
        price: 2200,
        grade: CardGrade.LEGENDARY,
        genre: CardGenre.LANDSCAPE,
        description: '아이슬란드의 신비로운 오로라',
        totalQuantity: 40,
        remainingQuantity: 25,
        imageUrl: 'https://example.com/aurora.jpg',
      },
    }),
    prisma.card.create({
      data: {
        ownerId: user2.id,
        name: '사막의 오아시스',
        price: 1800,
        grade: CardGrade.SUPER_RARE,
        genre: CardGenre.LANDSCAPE,
        description: '사하라 사막의 아름다운 오아시스',
        totalQuantity: 60,
        remainingQuantity: 40,
        imageUrl: 'https://example.com/oasis.jpg',
      },
    }),
  ]);

  await Promise.all([
    prisma.exchange.create({
      data: {
        requesterId: user1.id,
        offeredCardId: cards[0].id, // 마추픽추 카드
        targetCardId: user2Cards[0].id, // 오로라 카드
        status: 'REQUESTED',
      },
    }),
    prisma.exchange.create({
      data: {
        requesterId: user1.id,
        offeredCardId: cards[1].id, // 산토리니 카드
        targetCardId: user2Cards[1].id, // 오아시스 카드
        status: 'REQUESTED',
      },
    }),
    prisma.exchange.create({
      data: {
        requesterId: user2.id, // 두 번째 사용자
        offeredCardId: user2Cards[1].id, // 오아시스 카드
        targetCardId: cards[2].id, // 베니스 카드
        status: 'REQUESTED',
      },
    }),
  ]);

  console.log('Seed data has been created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
