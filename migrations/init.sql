-- Создаем таблицу users
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255),
  "is_admin" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Создаем таблицу contents
CREATE TABLE IF NOT EXISTS "contents" (
  "id" SERIAL PRIMARY KEY,
  "section_type" VARCHAR(50) NOT NULL,
  "section_key" VARCHAR(100) NOT NULL,
  "language" VARCHAR(10) NOT NULL DEFAULT 'ru',
  "content" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_by" INTEGER,
  "updated_by" INTEGER
);

CREATE INDEX IF NOT EXISTS "created_by_idx" ON "contents" ("created_by");
CREATE INDEX IF NOT EXISTS "updated_by_idx" ON "contents" ("updated_by");

-- Создаем таблицу content_revisions
CREATE TABLE IF NOT EXISTS "content_revisions" (
  "id" SERIAL PRIMARY KEY,
  "content_id" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "created_by" INTEGER
);

CREATE INDEX IF NOT EXISTS "content_id_idx" ON "content_revisions" ("content_id");
CREATE INDEX IF NOT EXISTS "rev_created_by_idx" ON "content_revisions" ("created_by");

-- Создаем таблицу media
CREATE TABLE IF NOT EXISTS "media" (
  "id" SERIAL PRIMARY KEY,
  "filename" VARCHAR(255) NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "path" VARCHAR(255) NOT NULL,
  "category" VARCHAR(50),
  "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "uploaded_by" INTEGER
);

CREATE INDEX IF NOT EXISTS "uploaded_by_idx" ON "media" ("uploaded_by");

-- Создаем таблицу contact_submissions
CREATE TABLE IF NOT EXISTS "contact_submissions" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) NOT NULL,
  "email" VARCHAR(255),
  "service" VARCHAR(255),
  "message" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Создаем сессионную таблицу для express-session
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" VARCHAR(255) NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS "sessions_expire_idx" ON "sessions" ("expire");

-- Создаем пользователя admin, если его нет
INSERT INTO users (username, password, name, is_admin) 
VALUES ('admin', '$2b$10$9eK/pNuVHqPQ5zvHqCHCGu4mO.vbCTnD7IRyEHr5fFwf.QE5xorSi', 'Administrator', TRUE)
ON CONFLICT (username) DO NOTHING;