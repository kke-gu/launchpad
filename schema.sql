-- Growth Launchpad Database Schema
-- D1 Database용 SQL 스키마

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 상품 테이블
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  proposal_file TEXT,
  basic_areas TEXT, -- JSON 문자열
  demo_areas TEXT, -- JSON 문자열
  case_areas TEXT, -- JSON 문자열
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 고객사 테이블
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 견적서 테이블
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  quote_title TEXT NOT NULL,
  quote_date TEXT NOT NULL,
  company_name TEXT,
  customer_id TEXT,
  purpose TEXT,
  manager_name TEXT,
  status TEXT NOT NULL DEFAULT '접수',
  status_history TEXT, -- JSON 문자열
  items TEXT NOT NULL, -- JSON 문자열
  total_amount REAL DEFAULT 0,
  note TEXT,
  is_temp INTEGER DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 견적서 템플릿 테이블
CREATE TABLE IF NOT EXISTS quote_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON 문자열
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 자료 테이블
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_date ON quotes(quote_date);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

