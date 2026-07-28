-- ==========================================
-- 1. DATABASE CREATION & INITIALIZATION
-- ==========================================

-- Create database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS miniflix;

-- Select database context
USE miniflix;

-- Drop tables in reverse order of dependency to avoid foreign key errors
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;


-- ==========================================
-- 2. CORE TABLE SCHEMAS
-- ==========================================

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movies table
CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  year INT NOT NULL,
  genre VARCHAR(120) NOT NULL,
  image VARCHAR(500) NOT NULL,
  video VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist table (Junction table between Users and Movies)
CREATE TABLE watchlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_movie (user_id, movie_id),

  CONSTRAINT fk_watchlist_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_watchlist_movie
    FOREIGN KEY (movie_id)
    REFERENCES movies(id)
    ON DELETE CASCADE
);


-- ==========================================
-- 3. CORE DATA INITIALIZATION (SEED DATA)
-- ==========================================

-- Seed movies
INSERT INTO movies (title, description, year, genre, image, video)
VALUES
(
  'Mountain Adventure',
  'A group of friends goes on a mountain trip, but they soon discover that the mountain hides dangerous secrets.',
  2024,
  'Action',
  'https://picsum.photos/id/1015/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
),
(
  'Dark Forest',
  'A mysterious forest becomes the center of a thrilling survival story.',
  2023,
  'Thriller',
  'https://picsum.photos/id/1016/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
),
(
  'Lost City',
  'An explorer searches for a hidden city filled with ancient secrets.',
  2022,
  'Adventure',
  'https://picsum.photos/id/1018/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
),
(
  'Ocean Mystery',
  'A deep sea mission reveals something unexpected under the ocean.',
  2024,
  'Mystery',
  'https://picsum.photos/id/1020/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
),
(
  'Night Hunter',
  'A detective hunts a dangerous criminal during the night.',
  2023,
  'Action',
  'https://picsum.photos/id/1024/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
),
(
  'Wild Dog',
  'An emotional story about a wild dog trying to survive in the city.',
  2021,
  'Drama',
  'https://picsum.photos/id/1025/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
),
(
  'Silent Night',
  'A quiet town is disturbed by a series of strange events.',
  2022,
  'Horror',
  'https://picsum.photos/id/1035/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
),
(
  'Desert Storm',
  'Soldiers must complete a dangerous mission in the desert.',
  2024,
  'War',
  'https://picsum.photos/id/1036/300/450',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
);

-- Seed initial demo user
INSERT INTO users (name, email, password, role)
VALUES
(
  'Demo User',
  'demo@example.com',
  'hashed_password_will_be_added_later',
  'user'
);

-- Seed watchlist entries for demo user
INSERT INTO watchlist (user_id, movie_id)
VALUES
(1, 1),
(1, 4),
(1, 7);


-- ==========================================
-- 4. FEATURE MIGRATION: SUBSCRIPTIONS & PLANS
-- ==========================================

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  features JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter users table to support subscription features
ALTER TABLE users
ADD COLUMN plan_id INT DEFAULT NULL,
ADD COLUMN subscription_status ENUM('active', 'canceled', 'past_due', 'none') DEFAULT 'none',
ADD COLUMN subscription_end DATETIME DEFAULT NULL,
ADD COLUMN stripe_subscription_id VARCHAR(255) DEFAULT NULL,
ADD CONSTRAINT fk_user_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;

-- Insert sample plans (Stripe test mode initial data)
INSERT INTO plans (name, price, stripe_price_id, features) VALUES
('Basic', 9.99, 'price_basic_test', '["720p HD", "1 screen", "No downloads"]'),
('Standard', 14.99, 'price_standard_test', '["1080p Full HD", "2 screens", "Download on 2 devices"]'),
('Premium', 19.99, 'price_premium_test', '["4K Ultra HD + HDR", "4 screens", "Download on 6 devices"]');


-- ==========================================
-- 5. FEATURE MIGRATION: WATCH PROGRESS, RATINGS & NOTIFICATIONS
-- ==========================================

-- Create watch progress tracking table
CREATE TABLE IF NOT EXISTS watch_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  seconds_watched INT NOT NULL DEFAULT 0,
  duration INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_movie_progress (user_id, movie_id),

  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_progress_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create movie ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_movie_rating (user_id, movie_id),

  CONSTRAINT fk_rating_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_rating_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(500) NOT NULL,
  type ENUM('new_movie', 'subscription_expiring', 'general') DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ==========================================
-- 6. DATA UPDATES & MAINTENANCE
-- ==========================================

-- Temporarily disable safe updates to perform batch modifications
SET SQL_SAFE_UPDATES = 0;

-- Update admin user permissions
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Update Stripe price IDs to live/specific test environment IDs
UPDATE plans
SET stripe_price_id = 'price_1TxVYbKOF4khcl0PQpUDeIMk'
WHERE name = 'Basic';

UPDATE plans
SET stripe_price_id = 'price_1TxVhzKOF4khcl0PsSeLsFsY'
WHERE name = 'Standard';

UPDATE plans
SET stripe_price_id = 'price_1TxVjJKOF4khcl0PsW5BARaL'
WHERE name = 'Premium';

-- Update movie video assets path to local paths
UPDATE movies SET video = 'assets/videos/sample.mp4';


-- ==========================================
-- 7. VERIFICATION QUERIES
-- ==========================================

SELECT * FROM movies;
SELECT * FROM users;
SELECT * FROM watchlist;
SELECT * FROM plans;
DESCRIBE users;
SELECT name, price, stripe_price_id FROM plans;
SELECT id, title, video FROM movies;
SELECT * FROM watch_progress;