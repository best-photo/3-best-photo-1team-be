# 풀스택 3기 파트3 1팀

- [팀 문서](https://www.notion.so/chobodev/16924202780c809a9cdee8926986f244?v=16924202780c811580b1000c2847f948)
- [Swagger](https://api.ooyoo.dev/api)

## 팀원 구성

- [강대원](https://github.com/Daewony)
- [박수환](https://github.com/soohwanpak)
- [이현우](https://github.com/gealot)
- [임예지](https://github.com/Bluemoon105)
- [정유석](https://github.com/yousuk88)
- [함헌규](https://github.com/heonq)

## 프로젝트 소개

- 개인용 디지털 사진첩 생성 플랫폼, 최애의 포토
- 프로젝트 기간: 2024.12.27 ~ 2025.1.21

## 기술 스택(프론트엔드)

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

### 박수환

### 이현우

### 임예지

### 정유석

### 함헌규

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
