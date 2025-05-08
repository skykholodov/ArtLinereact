-- Drop tables if they exist to ensure clean schema
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS content_revisions;
DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS session;

-- Session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Contents
CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  section_type VARCHAR(50) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'ru',
  content JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);
CREATE INDEX IDX_created_by ON contents (created_by);
CREATE INDEX IDX_updated_by ON contents (updated_by);

-- Content revisions
CREATE TABLE IF NOT EXISTS content_revisions (
  id SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES contents(id),
  content JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id)
);
CREATE INDEX IDX_content_id ON content_revisions (content_id);
CREATE INDEX IDX_rev_created_by ON content_revisions (created_by);

-- Media files
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  path VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  uploaded_by INTEGER REFERENCES users(id)
);
CREATE INDEX IDX_uploaded_by ON media (uploaded_by);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  service VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert default admin user if not exists
INSERT INTO users (username, password, name, is_admin)
VALUES ('admin', '$2b$10$9eK/pNuVHqPQ5zvHqCHCGu4mO.vbCTnD7IRyEHr5fFwf.QE5xorSi', 'Administrator', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert demo testimonials content
INSERT INTO contents (section_type, section_key, language, content, created_by, updated_by) 
VALUES (
  'testimonials', 
  'items', 
  'ru', 
  '{"items": [{"id": 1, "text": "Работаем с Art-Line уже третий год — от визиток до брендирования автомобилей. Всегда чётко, быстро и со вкусом. Особенно радует подход к деталям: всё продумано, ничего лишнего. Рекомендуем всем, кто ценит профессионализм!", "author": "Арт Директор", "rating": 5, "position": "корпоративный клиент"}, {"id": 2, "text": "Заказывали комплексное оформление офиса. От проекта до монтажа — все на высшем уровне. Команда Art-Line проявила креативность и понимание нашего бренда.", "author": "Анна", "rating": 5, "position": "руководитель отдела маркетинга"}, {"id": 3, "text": "Очень доволен работой агентства. Быстро и профессионально сделали брендирование автомобиля. Рекомендую!", "author": "Сергей", "rating": 5, "position": "предприниматель"}]}',
  1, 
  1
)
ON CONFLICT (section_type, section_key, language) DO NOTHING;