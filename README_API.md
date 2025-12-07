# Cloudflare Workers + D1 Database 설정 가이드

## 1. D1 Database 생성

### Cloudflare 대시보드에서 생성
1. Cloudflare 대시보드 → Workers & Pages → D1
2. "Create database" 클릭
3. Database name: `launchpad-db` 입력
4. 생성 후 Database ID 복사

### 또는 Wrangler CLI로 생성
```bash
npx wrangler d1 create launchpad-db
```

## 2. 데이터베이스 스키마 적용

### 로컬 개발 환경
```bash
npx wrangler d1 execute launchpad-db --local --file=./migrations/0001_initial_schema.sql
```

### 프로덕션 환경
```bash
npx wrangler d1 execute launchpad-db --remote --file=./migrations/0001_initial_schema.sql
```

## 3. wrangler.jsonc 업데이트

생성한 Database ID를 `wrangler.jsonc`의 `database_id`에 입력:
```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "launchpad-db",
      "database_id": "여기에_복사한_Database_ID_입력"
    }
  ]
}
```

## 4. API 엔드포인트

프로젝트에 `functions/api/` 폴더에 API 엔드포인트가 생성됩니다:
- `/api/quotes` - 견적서 CRUD
- `/api/products` - 상품 CRUD
- `/api/resources` - 자료 CRUD
- `/api/customers` - 고객사 CRUD
- `/api/templates` - 템플릿 CRUD

## 5. 프론트엔드 수정 필요

각 JavaScript 파일에서 `localStorage` 대신 API 호출로 변경:
- `assets/js/quote.js`
- `assets/js/products.js`
- `assets/js/resources.js`
- 등등...

## 6. 배포

변경사항을 GitHub에 푸시하면 Cloudflare Pages가 자동으로 배포합니다.




