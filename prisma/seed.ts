import { PrismaClient, CardGrade, CardGenre, PointType } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();

const images = [
  'https://cdn.pixabay.com/photo/2024/11/11/09/47/winter-9189662_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/11/24/06/33/fireworks-9220290_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/01/23/00/45/cat-7737618_1280.jpg',
  'https://cdn.pixabay.com/photo/2021/11/15/14/50/lake-6798400_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/12/13/10/23/woman-9264738_1280.jpg',
  'https://cdn.pixabay.com/photo/2022/06/10/03/59/lynx-7253623_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/02/02/11/22/mosque-8547944_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/07/01/07/11/cats-8864617_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/06/04/23/09/desert-8041046_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/11/23/08/18/christmas-9218404_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/11/22/13/20/man-9216455_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/01/30/11/04/cat-7755394_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/11/05/20/59/artistic-9176859_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/01/24/15/11/nave-7741260_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/11/03/22/57/dogs-9172481_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/10/23/09/00/dorset-9141987_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/10/22/01/17/cat-9138461_1280.jpg',
  'https://cdn.pixabay.com/photo/2024/05/24/08/52/birds-8784588_1280.jpg',
];

function generateCardData(ownerId: string, index: number) {
  const genres = [
    CardGenre.TRAVEL,
    CardGenre.LANDSCAPE,
    CardGenre.PORTRAIT,
    CardGenre.OBJECT,
  ];
  const grades = [
    CardGrade.COMMON,
    CardGrade.RARE,
    CardGrade.SUPER_RARE,
    CardGrade.LEGENDARY,
  ];

  const names = [
    [
      '에베레스트 등반',
      '그랜드캐니언',
      '나이아가라 폭포',
      '베니스 운하',
      '산토리니 일몰',
    ],
    [
      '알프스 설산',
      '아마존 열대우림',
      '사하라 사막',
      '아이슬란드 오로라',
      '하와이 화산',
    ],
    ['파리지앵의 초상', '베두인 족장', '티베트 승려', '마사이 전사', '게이샤'],
    [
      '빈티지 카메라',
      '기계식 시계',
      '앤틱 가구',
      '도자기 항아리',
      '크리스탈 샹들리에',
    ],
  ];

  const descriptions = [
    '세계에서 가장 높은 산을 담은 한 장의 사진',
    '자연이 만든 거대한 예술 작품을 포착한 순간',
    '문화와 전통이 살아 숨쉬는 순간을 담다',
    '시간이 멈춘 듯한 고요한 풍경',
    '현대와 전통이 공존하는 도시의 풍경',
  ];

  const genreIndex = index % genres.length;
  const nameIndex = Math.floor(Math.random() * names[genreIndex].length);
  const descIndex = Math.floor(Math.random() * descriptions.length);

  return {
    ownerId,
    name: `${names[genreIndex][nameIndex]} #${index}`,
    price: 1000 + index * 100,
    grade: grades[index % grades.length],
    genre: genres[genreIndex],
    description: `${descriptions[descIndex]} - ${index}번째 작품`,
    totalQuantity: 50 + (index % 50),
    remainingQuantity: 25 + (index % 25),
    imageUrl: images[Math.floor(Math.random() * images.length)],
  };
}

async function generatePointHistories(userId: string, count: number) {
  const pointTypes = Object.values(PointType);
  const histories = [];

  for (let i = 0; i < count; i++) {
    const type = pointTypes[i % pointTypes.length];
    const points =
      type === 'JOIN'
        ? 1000
        : type === 'DRAW'
          ? Math.floor(Math.random() * 1000)
          : type === 'PURCHASE'
            ? -Math.floor(Math.random() * 500)
            : type === 'EXCHANGE'
              ? -100
              : Math.floor(Math.random() * 200);

    histories.push(
      prisma.pointHistory.create({
        data: {
          userId,
          points,
          pointType: type,
        },
      }),
    );
  }

  return Promise.all(histories);
}

async function generateNotifications(userId: string, count: number) {
  const messages = [
    '새로운 교환 요청이 도착했습니다.',
    '카드가 판매되었습니다!',
    '교환 요청이 수락되었습니다.',
    '새로운 포인트가 적립되었습니다.',
    '카드 구매가 완료되었습니다.',
  ];

  const notifications = [];

  for (let i = 0; i < count; i++) {
    const messageIndex = i % messages.length;
    notifications.push(
      prisma.notification.create({
        data: {
          userId,
          content: messages[messageIndex],
          isRead: Math.random() > 0.5,
        },
      }),
    );
  }

  return Promise.all(notifications);
}

async function main() {
  // DB 초기화
  await prisma.pointHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.point.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.exchange.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.card.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await argon2.hash('qwer1!2@');

  // 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'test@test.com',
      password: hashedPassword,
      nickname: 'test1',
      point: {
        create: {
          balance: 50000,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'test2@test.com',
      password: hashedPassword,
      nickname: 'test2',
      point: {
        create: {
          balance: 50000,
        },
      },
    },
  });

  // 카드 생성
  const user1Cards = await Promise.all(
    Array.from({ length: 60 }, (_, i) =>
      prisma.card.create({
        data: generateCardData(user1.id, i),
      }),
    ),
  );

  const user2Cards = await Promise.all(
    Array.from({ length: 60 }, (_, i) =>
      prisma.card.create({
        data: generateCardData(user2.id, i + 60),
      }),
    ),
  );

  // 상점 데이터
  await Promise.all(
    user1Cards.slice(0, 50).map((card, i) => {
      const shouldBeZero = Math.random() < 0.2;
      return prisma.shop.create({
        data: {
          sellerId: user1.id,
          cardId: card.id,
          price: card.price + 500,
          initialQuantity: 10,
          remainingQuantity: shouldBeZero ? 0 : 5,
          exchangeGrade: CardGrade.SUPER_RARE,
          exchangeGenre: CardGenre.LANDSCAPE,
          exchangeDescription: `희망하는 교환 조건: ${i}번 카드`,
        },
      });
    }),
  );

  // 교환 요청
  await Promise.all(
    user1Cards.slice(0, 25).map((card) =>
      prisma.exchange.create({
        data: {
          requesterId: user1.id,
          offeredCardId: card.id,
          targetCardId: user2Cards[0].id,
          status: 'REQUESTED',
        },
      }),
    ),
  );

  await Promise.all(
    user2Cards.slice(0, 25).map((card) =>
      prisma.exchange.create({
        data: {
          requesterId: user2.id,
          offeredCardId: card.id,
          targetCardId: user1Cards[0].id,
          status: 'REQUESTED',
        },
      }),
    ),
  );

  // 포인트 히스토리 생성
  await generatePointHistories(user1.id, 50);
  await generatePointHistories(user2.id, 50);

  // 알림 생성
  await generateNotifications(user1.id, 30);
  await generateNotifications(user2.id, 30);

  // 구매 내역 생성
  const shops = await prisma.shop.findMany({
    take: 20,
  });

  await Promise.all(
    shops.map((shop) =>
      prisma.purchase.create({
        data: {
          buyerId: user2.id,
          shopId: shop.id,
        },
      }),
    ),
  );

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
