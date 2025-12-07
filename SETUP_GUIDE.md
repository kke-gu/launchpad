# Cloudflare Workers + D1 Database 설정 가이드

## 개요

현재 프로젝트는 브라우저의 `localStorage`를 사용하여 각 사용자의 컴퓨터에만 데이터를 저장합니다. 다른 사람들과 데이터를 공유하려면 Cloudflare Workers + D1 Database를 사용해야 합니다.

## 단계별 설정 방법

### 1단계: D1 Database 생성

#### 방법 A: Cloudflare 대시보드에서 생성
1. [Cloudflare 대시보드](https://dash.cloudflare.com) 접속
2. **Workers & Pages** → **D1** 메뉴 선택
3. **Create database** 버튼 클릭
4. Database name: `launchpad-db` 입력
5. **Create** 클릭
6. 생성된 Database의 **ID** 복사 (예: `a1b2c3d4e5f6g7h8i9j0`)

#### 방법 B: Wrangler CLI로 생성
```bash
npx wrangler d1 create launchpad-db
```

### 2단계: wrangler.jsonc 업데이트

생성한 Database ID를 `wrangler.jsonc` 파일에 추가:

```json
{
  "name": "launchpad",
  "compatibility_date": "2025-12-06",
  "assets": {
    "directory": ".",
    "exclude": [".git/**", ".gitignore", "wrangler.jsonc", "schema.sql", "migrations/**"]
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "launchpad-db",
      "database_id": "여기에_복사한_Database_ID_입력"
    }
  ]
}
```

### 3단계: 데이터베이스 스키마 적용

#### 로컬 개발 환경 (테스트용)
```bash
npx wrangler d1 execute launchpad-db --local --file=./migrations/0001_initial_schema.sql
```

#### 프로덕션 환경 (실제 배포)
```bash
npx wrangler d1 execute launchpad-db --remote --file=./migrations/0001_initial_schema.sql
```

### 4단계: API 엔드포인트 확인

프로젝트에 다음 API 엔드포인트가 생성되었습니다:
- `functions/api/quotes.js` - 견적서 CRUD
- `functions/api/products.js` - 상품 CRUD
- `functions/api/resources.js` - 자료 CRUD
- `functions/api/customers.js` - 고객사 CRUD
- `functions/api/templates.js` - 템플릿 CRUD

### 5단계: 프론트엔드 코드 수정

각 JavaScript 파일에서 `localStorage` 대신 API를 사용하도록 수정해야 합니다.

#### 예시: quote.js 수정

**기존 코드:**
```javascript
function getQuotes() {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveQuote(quote) {
    const quotes = getQuotes();
    // ... 저장 로직
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
}
```

**새로운 코드:**
```javascript
import { quotesAPI } from './api.js';

async function getQuotes() {
    try {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!currentUser) return [];
        
        return await quotesAPI.getAll({ createdBy: currentUser.email });
    } catch (error) {
        console.error('견적서 목록 가져오기 실패:', error);
        return [];
    }
}

async function saveQuote(quote) {
    try {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!currentUser) throw new Error('로그인이 필요합니다');
        
        quote.createdBy = currentUser.email;
        
        if (quote.id) {
            await quotesAPI.update(quote.id, quote);
        } else {
            const result = await quotesAPI.create(quote);
            quote.id = result.id;
        }
        
        return quote;
    } catch (error) {
        console.error('견적서 저장 실패:', error);
        alert('견적서 저장에 실패했습니다: ' + error.message);
        throw error;
    }
}
```

### 6단계: 수정이 필요한 파일들

다음 파일들을 API 사용으로 수정해야 합니다:
- `assets/js/quote.js` - 견적서 관리
- `assets/js/products.js` - 상품 관리
- `assets/js/resources.js` - 자료 관리
- `assets/js/resource-register.js` - 자료 등록
- `assets/js/status.js` - 상태 관리
- `assets/js/quote-detail.js` - 견적서 상세
- `assets/js/index.js` - 대시보드

### 7단계: HTML 파일에 API 스크립트 추가

각 HTML 파일의 `<head>` 또는 `<body>` 끝에 추가:
```html
<script type="module" src="assets/js/api.js"></script>
```

### 8단계: 배포

변경사항을 GitHub에 푸시하면 Cloudflare Pages가 자동으로 배포합니다.

## API 엔드포인트 목록

### 견적서
- `GET /api/quotes` - 전체 목록 조회
- `GET /api/quotes?created_by=email&status=접수` - 필터링 조회
- `GET /api/quotes/:id` - 특정 견적서 조회
- `POST /api/quotes` - 새 견적서 생성
- `PUT /api/quotes/:id` - 견적서 수정
- `DELETE /api/quotes/:id` - 견적서 삭제

### 상품
- `GET /api/products` - 전체 목록
- `GET /api/products/:id` - 특정 상품 조회
- `POST /api/products` - 새 상품 생성
- `PUT /api/products/:id` - 상품 수정
- `DELETE /api/products/:id` - 상품 삭제

### 자료
- `GET /api/resources` - 전체 목록
- `GET /api/resources?category=카테고리` - 카테고리별 조회
- `GET /api/resources/:id` - 특정 자료 조회
- `POST /api/resources` - 새 자료 생성
- `PUT /api/resources/:id` - 자료 수정
- `DELETE /api/resources/:id` - 자료 삭제

## 주의사항

1. **인증**: 현재는 `createdBy` 필드로만 필터링합니다. 실제 프로덕션에서는 JWT 토큰 등의 인증 메커니즘을 추가해야 합니다.

2. **에러 처리**: API 호출 실패 시 적절한 에러 처리가 필요합니다.

3. **로딩 상태**: API 호출 중 로딩 인디케이터를 표시하는 것이 좋습니다.

4. **오프라인 지원**: 필요하다면 Service Worker를 추가하여 오프라인에서도 작동하도록 할 수 있습니다.

## 다음 단계

1. D1 Database 생성 및 ID 설정
2. 스키마 적용
3. 프론트엔드 코드 수정 (점진적으로 진행 가능)
4. 테스트 및 배포




