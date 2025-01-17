# 최애의 포토 백엔드

## Description

[Nest](https://github.com/nestjs/nest) 프레임워크를 사용한 최애의 포토 백엔드 입니다.

## Tech Stacks

- NodeJS 20
- NestJS 10.4.9
- Typescript 5.7.2

## 프로젝트 설정

### 프로젝트 초기화

- npm i -g @nestjs/cli 를 통해 nest cli 설치
- nest new best-photo-be 를 통해 프로젝트 생성

### CRUD 생성

- nest g res auth 를 통해 인증 관련 CRUD 리소스 생성
- nest g res shop 을 통해 상점 관련 CRUD 리소스 생성
- nest g res cards 를 통해 카드 관련 CRUD 리소스 생성
- nest g res notifications 를 통해 알림 관련 CRUD 리소스 생성
- nest g res users 를 통해 유저 관련 CRUD 리소스 생성
- nest g res points 를 통해 포인트 관련 CRUD 리소스 생성

### 환경변수 설정

- npm i @nestjs/config 를 설치하여 NestJS에서 환경변수 세팅
- npx prisma init --datasource-provider postgresql 를 통해 prisma 스키마 초기환경 구축
- npm i @prisma/client 설치 및 prisma.service.ts 세팅

### Prisma 모델 설정 및 마이그레이션

- prisma/schema.prisma에 모델(인증, 상점, 카드, 알림, 유저, 포인트 모델) 설정
- npx prisma migrate dev --name init을 통해 서버에 마이그레이션

### 백엔드 코드 Push

- 원격 저장소 추가

```bash
git remote add origin https://github.com/best-photo/3-best-photo-1team-be.git
```

- 깃 변경사항 반영 커밋

```bash
git add . && git commit -m 'initial commit'
```

- 초기 설정 Remote Repository에 push

```bash
git push origin main
```

## 패키지 설치 방법

### 노드 버전 설치

#### Windows 기준

- Windows 11 : Windows 설정(단축키 : Win+i) - 앱 - 앱 및 기능 - 설치된 node 버전 제거
- Windows 10 이하 : Windows 검색(단축키 : Win+s) - 제어판 검색 - 프로그램 제거 - 설치된 node 버전 제거
- nvm(node version manager) 설치하기 : [nvm-setup.exe](https://github.com/coreybutler/nvm-windows/releases/download/1.2.1/nvm-setup.zip) 내려받아 nvm 설치(꽌리자 권한으로 설치)
- git bash에서 nvm 사용가능 여부 확인

  ```bash
  $ nvm -v
  0.40.1
  ```

- nvm으로 노드 버전 설치(.nvmrc에 기재된 버전으로 노드 설치)

  ```bash
  $ nvm install
  Found '${workspace}/.nvmrc' with version <20>
  Downloading and installing node v20.18.1...
  Downloading https://nodejs.org/dist/v20.18.1/node-v20.18.1-win-x64.tar.xz...
  Computing checksum with sha256sum
  Checksums matched!
  Now using node v20.18.1 (npm v10.8.2)
  Creating default alias: default -> 20 (-> v20.18.1)
  $ nvm use
  Found '${workspace}/.nvmrc' with version <20>
  Now using node v20.18.1 (npm v10.8.2)
  ```

#### macOS 기준

- 터미널에서 brew uninstall node를 통해 기존 node 버전 삭제
- 터미널에서 아래 코드 중 하나를 선택하여 nvm 설치

  ```bash
  $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  => Downloading nvm from git to '~/.nvm'
  ...
  $ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  => Downloading nvm from git to '~/.nvm'
  ...
  ```

- vi ~/.zshrc 열어서 맨 아래에 아래 스크립트 추가

  ```zsh
  export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  ```

- nvm 사용가능 여부 확인

  ```bash
  $ command -v nvm
  0.40.1
  ```

- nvm으로 노드 버전 설치(.nvmrc에 기재된 버전으로 노드 설치)

  ```bash
  $ nvm install
  Found '${workspace}/.nvmrc' with version <20>
  Downloading and installing node v20.18.1...
  Downloading https://nodejs.org/dist/v20.18.1/node-v20.18.1-darwin-arm64.tar.xz...
  Computing checksum with sha256sum
  Checksums matched!
  Now using node v20.18.1 (npm v10.8.2)
  Creating default alias: default -> 20 (-> v20.18.1)
  $ nvm use
  Found '${workspace}/.nvmrc' with version <20>
  Now using node v20.18.1 (npm v10.8.2)
  ```

</details>

### 프로젝트에 필요한 패키지 설치

```bash
$ npm install
best-photo-be@0.0.1
├── @nestjs/cli@10.4.9
├── @nestjs/common@10.4.15
├── @nestjs/core@10.4.15
...(생략)
```

## 프로젝트 실행 방법

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API 문서 확인 방법

```bash
$ npm run start:dev
# 실행 후 http://localhost:8080/api 접속
```
