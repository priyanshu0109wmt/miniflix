DROP DATABASE IF EXISTS miniflix;
CREATE DATABASE miniflix;
USE miniflix;

CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stripe_price_id VARCHAR(255) NOT NULL,
    features JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    plan_id INT DEFAULT NULL,
    subscription_status ENUM('active','canceled','past_due','none') DEFAULT 'none',
    subscription_end DATETIME DEFAULT NULL,
    stripe_subscription_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
);

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

CREATE INDEX idx_movie_title ON movies(title);
CREATE INDEX idx_movie_genre ON movies(genre);
CREATE INDEX idx_movie_year ON movies(year);
CREATE INDEX idx_user_email ON users(email);

INSERT INTO plans (name, price, stripe_price_id, features) VALUES
('Basic', 9.99, 'price_1TxVYbKOF4khcl0PQpUDeIMk', '["720p HD","1 Screen","No Downloads"]'),
('Standard', 14.99, 'price_1TxVhzKOF4khcl0PsSeLsFsY', '["1080p Full HD","2 Screens","Downloads"]'),
('Premium', 19.99, 'price_1TxVjJKOF4khcl0PsW5BARaL', '["4K UHD","4 Screens","Downloads","HDR"]');

INSERT INTO users (name, email, password, role) VALUES
('Demo User', 'demo@example.com', 'hashed_password_will_be_added_later', 'user');

INSERT INTO movies (title, description, year, genre, image, video) VALUES
('Mountain Adventure', 'A group of friends explores dangerous mountains.', 2024, 'Action', 'https://picsum.photos/id/1015/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('Dark Forest', 'A mysterious forest hides deadly secrets.', 2023, 'Thriller', 'https://picsum.photos/id/1016/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('Lost City', 'Explorer searches for an ancient hidden city.', 2022, 'Adventure', 'https://picsum.photos/id/1018/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('Ocean Mystery', 'Deep sea expedition uncovers a mystery.', 2024, 'Mystery', 'https://picsum.photos/id/1020/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('Night Hunter', 'Detective hunts a dangerous criminal.', 2023, 'Action', 'https://picsum.photos/id/1024/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),
('Wild Dog', 'Story of survival in a modern city.', 2021, 'Drama', 'https://picsum.photos/id/1025/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'),
('Silent Night', 'Strange events disturb a peaceful town.', 2022, 'Horror', 'https://picsum.photos/id/1035/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'),
('Desert Storm', 'Soldiers undertake a dangerous mission.', 2024, 'War', 'https://picsum.photos/id/1036/300/450', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

CREATE TABLE watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_watchlist UNIQUE(user_id, movie_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlist_movie FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE watch_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    seconds_watched INT NOT NULL DEFAULT 0,
    duration INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_progress UNIQUE(user_id, movie_id),
    CONSTRAINT fk_progress_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_movie FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    score TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK(score BETWEEN 1 AND 5),
    CONSTRAINT uq_rating UNIQUE(user_id, movie_id),
    CONSTRAINT fk_rating_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_movie FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type ENUM('new_movie', 'subscription_expiring', 'general') DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_movie ON watchlist(movie_id);
CREATE INDEX idx_progress_user ON watch_progress(user_id);
CREATE INDEX idx_progress_updated ON watch_progress(updated_at);
CREATE INDEX idx_rating_movie ON ratings(movie_id);
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_unread ON notifications(user_id, is_read);

INSERT INTO watchlist (user_id, movie_id) VALUES (1, 1), (1, 4), (1, 7);

INSERT INTO watch_progress (user_id, movie_id, seconds_watched, duration) VALUES
(1, 1, 480, 7200),
(1, 4, 1200, 6500);

INSERT INTO ratings (user_id, movie_id, score) VALUES
(1, 1, 5),
(1, 4, 4),
(1, 7, 5);

INSERT INTO notifications (user_id, message, type) VALUES
(1, 'Welcome to Miniflix!', 'general'),
(1, 'Premium Plan Available', 'general'),
(1, 'New movie added: Mountain Adventure', 'new_movie');

SHOW TABLES;
SELECT * FROM plans;
SELECT * FROM users;
SELECT * FROM movies;
SELECT * FROM watchlist;
SELECT * FROM watch_progress;
SELECT * FROM ratings;
SELECT * FROM notifications;
DESCRIBE users;
DESCRIBE movies;
DESCRIBE plans;
DESCRIBE watchlist;
DESCRIBE watch_progress;
DESCRIBE ratings;
DESCRIBE notifications;