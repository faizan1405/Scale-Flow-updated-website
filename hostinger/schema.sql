-- Scale Flow production schema (MySQL 8, InnoDB, utf8mb4).
-- Not applied anywhere yet. Run on the Hostinger MySQL database in phase 1.
SET NAMES utf8mb4;

CREATE TABLE admin_users (
  id CHAR(26) PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_logins INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_roles (
  user_id CHAR(26) NOT NULL,
  role ENUM('owner','editor') NOT NULL,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sessions (
  id_hash CHAR(64) PRIMARY KEY,
  user_id CHAR(26) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  revoked_at DATETIME NULL,
  INDEX (user_id),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE login_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  success TINYINT(1) NOT NULL,
  at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (email, at), INDEX (ip, at)
) ENGINE=InnoDB;

CREATE TABLE media_assets (
  id CHAR(26) PRIMARY KEY,
  kind ENUM('image','video') NOT NULL,
  purpose ENUM('screenshot','mobile','thumbnail','walkthrough','showreel','other') NOT NULL DEFAULT 'other',
  storage_path VARCHAR(255) NULL,          -- NULL when external_url is used
  external_url VARCHAR(500) NULL,          -- existing Lovable-hosted screenshots
  original_name VARCHAR(255) NOT NULL DEFAULT '',
  mime VARCHAR(80) NOT NULL,
  bytes BIGINT NOT NULL DEFAULT 0,
  width INT NULL, height INT NULL, duration_s DECIMAL(8,2) NULL,
  sha256 CHAR(64) NULL UNIQUE,
  variants JSON NULL,
  created_by CHAR(26) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE projects (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  client VARCHAR(200) NOT NULL DEFAULT '',
  primary_category_id VARCHAR(64) NOT NULL,
  kind ENUM('client','concept','demo','unverified') NOT NULL DEFAULT 'unverified',
  summary TEXT, overview TEXT, context TEXT, goals TEXT, approach TEXT,
  palette JSON NOT NULL,
  ambient_color VARCHAR(16) NULL,
  layout VARCHAR(32) NOT NULL,
  cover_media_id CHAR(26) NULL,
  video_media_id CHAR(26) NULL,
  live_url VARCHAR(500) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  is_sample TINYINT(1) NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (primary_category_id) REFERENCES categories(id),
  FOREIGN KEY (cover_media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  FOREIGN KEY (video_media_id) REFERENCES media_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE project_categories (
  project_id VARCHAR(64) NOT NULL, category_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (project_id, category_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE project_values (
  project_id VARCHAR(64) NOT NULL,
  list ENUM('tag','capability','deliverable') NOT NULL,
  value VARCHAR(200) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, list, sort_order),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE project_media (
  project_id VARCHAR(64) NOT NULL, media_id CHAR(26) NOT NULL,
  role ENUM('desktop','mobile') NOT NULL, sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, media_id, role),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE videos (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL, description TEXT,
  project_id VARCHAR(64) NULL, category_id VARCHAR(64) NULL,
  media_id CHAR(26) NULL, thumbnail_media_id CHAR(26) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0, published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE SET NULL,
  FOREIGN KEY (thumbnail_media_id) REFERENCES media_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE quote_packages (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(120) NOT NULL, tagline VARCHAR(255) NOT NULL DEFAULT '',
  price_inr INT NULL,  -- NULL = custom quote
  enabled TINYINT(1) NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE quote_features (
  id VARCHAR(64) PRIMARY KEY, name VARCHAR(120) NOT NULL, description VARCHAR(255) NOT NULL DEFAULT '',
  price_inr INT NULL,  -- NULL = priced on request
  enabled TINYINT(1) NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE package_included_features (
  package_id VARCHAR(64) NOT NULL, feature_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (package_id, feature_id),
  FOREIGN KEY (package_id) REFERENCES quote_packages(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES quote_features(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Empty for a feature = available for every package.
CREATE TABLE feature_availability (
  feature_id VARCHAR(64) NOT NULL, package_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (feature_id, package_id),
  FOREIGN KEY (package_id) REFERENCES quote_packages(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES quote_features(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE settings (
  `key` VARCHAR(64) PRIMARY KEY, value JSON NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(26) NULL, action VARCHAR(32) NOT NULL,
  entity VARCHAR(32) NOT NULL, entity_id VARCHAR(64) NOT NULL,
  before_json JSON NULL, after_json JSON NULL,
  at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (entity, entity_id)
) ENGINE=InnoDB;

CREATE TABLE import_batches (
  id CHAR(26) PRIMARY KEY,
  source_file_sha256 CHAR(64) NOT NULL,
  status ENUM('previewed','applied','rolled_back','failed') NOT NULL,
  summary JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_at DATETIME NULL, rolled_back_at DATETIME NULL
) ENGINE=InnoDB;
