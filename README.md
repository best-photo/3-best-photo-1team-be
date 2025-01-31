# 풀스택 3기 파트3 1팀

- [팀 문서](https://www.notion.so/chobodev/16924202780c809a9cdee8926986f244?v=16924202780c811580b1000c2847f948)
- [Swagger](https://api.ooyoo.dev/api)

## 팀원 구성
| 이름 | 역할 | Github |
|------|------|---------|
| 🧭 강대원 | FullStack | [@Daewony](https://github.com/Daewony) |
| 🌟 박수환 | FullStack | [@soohwanpak](https://github.com/soohwanpak) |
| 🏗️ 이현우 | FullStack | [@gealot](https://github.com/gealot) |
| 🎯 임예지 | FullStack | [@Bluemoon105](https://github.com/Bluemoon105) |
| 💫 정유석 | FullStack | [@yousuk88](https://github.com/yousuk88) |
| 🎨 함헌규 | FullStack | [@heonq](https://github.com/heonq) |

## 프로젝트 소개

- 개인용 디지털 사진첩 생성 플랫폼, 최애의 포토
- 프로젝트 기간: 2024.12.27 ~ 2025.1.21

## 기술 스택(백엔드)

- Nest.js
- Typescript
- Prisma
- PostgreSQL
- argon2
- class-validator/transformer
- multer
- passport
- jwt

---

## 팀원별 구현 기능 상세

### 강대원

#### 백엔드 프로젝트 데이터 모델링 개선
- 기존 테이블 필요없는 필드 및 필요한 필드 추가 제안 및 스키마 적용
  - 교환 제시 내용이 필요한데, description 필드 없어서 추가
  - 구매 및 거래 테이블 관계 수정 및 적용
  - 기존: ![image](https://github.com/user-attachments/assets/182b9f5c-4d96-4618-8c3f-40b893ba116f)
  - 개선: ![image](https://github.com/user-attachments/assets/c63c73ae-ceb1-43a1-9198-281ec2cba5cf)
  - 기존 테이블의 문제점:
    - 카드 판매가 Shop을 거치지 않고 직접 이루어짐, 실제 판매 가격, 수량 등의 정보가 불명확
    - Exchange가 직접 Card를 참조 , 교환 상태 관리 부재
    - Shop 테이블, quantity 필드만 있어서 초기수량과 남은수량 구분 불가
  - 개선사항
    - Shop을 중심으로 한 거래 구조로 개선하여 관계 명확하게함
    - 거래의 중심이 Card에서 Shop으로 이동, 판매 가격, 수량이 Shop에서 명확하게 관리됨
    - Shop테이블의 initialQuantity와 remainingQuantity로 재고 관리 개선
    - Exchange에 status 필드 추가로 교환 진행상태 추적 가능
 
#### 알람(Notifications) API 구현
- 최신순으로 알람 목록 조회 API 구현
- 알람 메시지 개별 읽음 요청 API 구현

#### 포토카드 판매 상세 페이지
- 포토카드 상세 목록 조회 API 구현
  - 해당 판매 카드 정보 조회
  - 해당 판매 카드와 교환할 교환 제시 목록 조회
  - 구매자의 판매카드와 교환할 교환 희망 정보 조회

- 구매자가 제시한 판매자가 등록한 포토카드와 교환 신청 API 구현
  - 판매자의 교환 신청 알람 생성
  - 구매자가 제시한 교환 카드 목록 정보 추가

- 구매자의 포토카드 구매 요청 API 구현
  - 구매 동시성을 위한 트랜잭션 추가
  - 구매자의 포인트 감소
  - 구매자의 새로운 포토카드 생성(포토카드 id는 자동생성으로 변경되지만, 내용은 동일함)
  - 판매자의 포토카드 소모
  - 구매자에게 해당 포토카드 구매 알림 생성
  - 판매자에게 해당 포토카드 판매 및 품절 알림 생성

### 박수환

####
마켓플레이스 페이지
- 프론트에서 입력한 query, filter정보에 맞는 데이터 반환 API 구현
- 모바일 화면 필터모달에 필요한 데이터 반환, 모바일필터에서 선택한 값에 따른 데이터 반환 API 구현

####
나의 포토카드 판매하기 모달( 판매할 포토카드 선택 모달) 
- 로그인한 유저의 ID를 이용해 해당 유저의 카드목록( 판매등록안되어있는 카드) 데이터 반환 API 구현
- 프론트에서 입력한 query, filter정보에 맞는 데이터 반환 API 구현

####
교환 희망 정보 입력 모달( 판매할 포토카드 선택 후)
- 사용자가 입력한 판매희망 가격, 판매희망 수량, / 교환 희망 장르,등급,설명 데이터 상점에 등록 API 구현

### 이현우

#### 백엔드 프로젝트 초기 세팅
- 백엔드 프로젝트 생성 및 기본 구조 설정
- 스키마 작성 및 마이그레이션 형상관리
- auto_increment의 예측 공격 등을 예방하고 uuid의 무작위성을 동시에 보장하기 위해 cuid2를 PK로 사용
- 무작위 대입(rainbow attack), 부채널 공격(side-channel attack)을 막기 위해 argon2를 패스워드 암호화 알고리즘으로 사용 

#### 인증(Auth) API
- NestJS의 Guard를 이용하여, 회원만 볼 수 있는 페이지 등 특정 페이지나 경로에 대해 사용자 권한을 제어하였습니다.
- 커스텀 데코레이터를 이용하여, 요청 쿠키(JWT AccessToken)에서 사용자 정보를 추출하여 로그인한 사용자Id를 쉽게 획득할 수 있도록 하였습니다.
- 회원가입, 로그인, 로그아웃, 토큰 리프레쉬 API 구현

#### 유저(Users) API
- 회원 프로필(유저ID, 이메일, 닉네임, 포인트 등) 조회 API 구현
- 이메일, 닉네임 중복 체크 API 구현

#### 포인트(Points) API
- 랜덤포인트 상자 열기(당첨확률 가중치 고려) API 구현
- 마지막으로 랜덤포인트를 연 시간(last-draw-time) API 구현

### 임예지

- 마이갤러리 페이지
  - 로그인한 사용자가 소유한 포토카드 조회 API
  - 필터링 기능 추가

- 마이갤러리 상세 페이지
  - 포토카드 id를 통한 상세 조회 API
 
- 포토 카드 생성 페이지
  - 포토 카드 생성 API
  - 포스트한 이미지 불러오기 API

### 정유석
- 이번 프로젝트에서는 프론트엔드 파트에만 참여하였습니다.

### 함헌규
- 사용자가 판매중이거나 교환 제시한 포토카드를 조회하는 API 구현 (쿼리 파라미터에 따라 불러올 데이터를 필터링하고 페이지네이션하는 기능 포함)
- 사용자가 판매중이거나 교환 제시한 포토카드의 전체 수량을 조회하는 API 구현
- 스키마 테이블에 맞는 mockdata를 구성하고 seed 코드 작성
- multer를 사용해 이미지 업로드 시 이미지 경로 앞에 서버의 배포 주소를 추가하도록 수정
- 수환님과 논의해서 Shop 테이블에 필드 추가 결정

## 파일 구조

```
📦3-best-photo-1team-be
 ┣ 📂prisma
 ┃ ┣ 📂migrations
 ┃ ┃ ┣ 📂20250119144851_init
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┃ ┗ 📂20250120063052_
 ┃ ┃ ┃ ┗ 📜migration.sql
 ┃ ┣ 📂schema
 ┃ ┃ ┣ 📜Card.prisma
 ┃ ┃ ┣ 📜Exchange.prisma
 ┃ ┃ ┣ 📜Notification.prisma
 ┃ ┃ ┣ 📜Point.prisma
 ┃ ┃ ┣ 📜PointHistory.prisma
 ┃ ┃ ┣ 📜Purchase.prisma
 ┃ ┃ ┣ 📜Shop.prisma
 ┃ ┃ ┣ 📜User.prisma
 ┃ ┃ ┗ 📜schema.prisma
 ┃ ┗ 📜seed.ts
 ┣ 📂src
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📂decorators
 ┃ ┃ ┃ ┗ 📜get-user.decorator.ts
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📜auth.dto.ts
 ┃ ┃ ┃ ┣ 📜create-auth.dto.ts
 ┃ ┃ ┃ ┗ 📜update-auth.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜auth.entity.ts
 ┃ ┃ ┣ 📜auth.controller.ts
 ┃ ┃ ┣ 📜auth.guard.ts
 ┃ ┃ ┣ 📜auth.module.ts
 ┃ ┃ ┣ 📜auth.service.ts
 ┃ ┃ ┣ 📜jwt.strategy.ts
 ┃ ┃ ┗ 📜refresh-token.strategy.ts
 ┃ ┣ 📂cards
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📂exchangeCards
 ┃ ┃ ┃ ┃ ┗ 📜my-exchange-card.dto.ts
 ┃ ┃ ┃ ┣ 📂sellingCards
 ┃ ┃ ┃ ┃ ┗ 📜my-selling-card.dto.ts
 ┃ ┃ ┃ ┣ 📜cards.dto.ts
 ┃ ┃ ┃ ┣ 📜create-card.dto.ts
 ┃ ┃ ┃ ┣ 📜propose-exchange-card.dto.ts
 ┃ ┃ ┃ ┗ 📜update-card.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜card.entity.ts
 ┃ ┃ ┣ 📜cards.controller.ts
 ┃ ┃ ┣ 📜cards.module.ts
 ┃ ┃ ┗ 📜cards.service.ts
 ┃ ┣ 📂image
 ┃ ┃ ┗ 📜image.controller.ts
 ┃ ┣ 📂notifications
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📜create-notification.dto.ts
 ┃ ┃ ┃ ┣ 📜notifications.dto.ts
 ┃ ┃ ┃ ┗ 📜update-notification.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜notification.entity.ts
 ┃ ┃ ┣ 📜notifications.controller.ts
 ┃ ┃ ┣ 📜notifications.module.ts
 ┃ ┃ ┗ 📜notifications.service.ts
 ┃ ┣ 📂points
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📜create-point.dto.ts
 ┃ ┃ ┃ ┣ 📜points.dto.ts
 ┃ ┃ ┃ ┗ 📜update-point.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜point.entity.ts
 ┃ ┃ ┣ 📜points.controller.ts
 ┃ ┃ ┣ 📜points.module.ts
 ┃ ┃ ┗ 📜points.service.ts
 ┃ ┣ 📂prisma
 ┃ ┃ ┣ 📜prisma.module.ts
 ┃ ┃ ┗ 📜prisma.service.ts
 ┃ ┣ 📂shared
 ┃ ┃ ┗ 📂swagger
 ┃ ┃ ┃ ┣ 📜ApiCustomDocs.ts
 ┃ ┃ ┃ ┗ 📜swagger.options.ts
 ┃ ┣ 📂shop
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📜create-shop.dto.ts
 ┃ ┃ ┃ ┣ 📜purchase-card.dto.ts
 ┃ ┃ ┃ ┣ 📜purchase-response.dto.ts
 ┃ ┃ ┃ ┣ 📜shop.dto.ts
 ┃ ┃ ┃ ┗ 📜update-shop.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜shop.entity.ts
 ┃ ┃ ┣ 📜shop.controller.ts
 ┃ ┃ ┣ 📜shop.module.ts
 ┃ ┃ ┗ 📜shop.service.ts
 ┃ ┣ 📂users
 ┃ ┃ ┣ 📂dto
 ┃ ┃ ┃ ┣ 📜create-user.dto.ts
 ┃ ┃ ┃ ┣ 📜update-user.dto.ts
 ┃ ┃ ┃ ┗ 📜user.dto.ts
 ┃ ┃ ┣ 📂entities
 ┃ ┃ ┃ ┗ 📜user.entity.ts
 ┃ ┃ ┣ 📂services
 ┃ ┃ ┃ ┣ 📜filter-factory.service.ts
 ┃ ┃ ┃ ┣ 📜genre-filter.service.ts
 ┃ ┃ ┃ ┣ 📜grade-filter.service.ts
 ┃ ┃ ┃ ┣ 📜sales-method-filter.service.ts
 ┃ ┃ ┃ ┣ 📜service.types.ts
 ┃ ┃ ┃ ┗ 📜stock-state-filter.service.ts
 ┃ ┃ ┣ 📜users.controller.ts
 ┃ ┃ ┣ 📜users.module.ts
 ┃ ┃ ┗ 📜users.service.ts
 ┃ ┣ 📜app.controller.ts
 ┃ ┣ 📜app.module.ts
 ┃ ┣ 📜app.service.ts
 ┃ ┗ 📜main.ts
 ┣ 📂test
 ┃ ┣ 📜app.e2e-spec.ts
 ┃ ┗ 📜jest-e2e.json
 ┣ 📂uploads
 ┣ 📜.dockerignore
 ┣ 📜.editorconfig
 ┣ 📜.env
 ┣ 📜.eslintrc.js
 ┣ 📜.gitignore
 ┣ 📜.npmrc
 ┣ 📜.prettierrc
 ┣ 📜.tool-versions
 ┣ 📜Dockerfile
 ┣ 📜README.md
 ┣ 📜fly.toml
 ┣ 📜nest-cli.json
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜tsconfig.build.json
 ┗ 📜tsconfig.json
```
