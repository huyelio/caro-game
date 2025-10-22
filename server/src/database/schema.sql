-- =====================================================
-- CARO GAME PLATFORM - DATABASE SCHEMA
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS game_stats CASCADE;
DROP TABLE IF EXISTS game_history CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLE: users
-- Lưu thông tin người dùng
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- TABLE: game_stats
-- Thống kê tổng quan của người chơi
-- =====================================================
CREATE TABLE game_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  total_time_played INTEGER DEFAULT 0, -- in seconds
  highest_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 1000, -- ELO rating
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for leaderboard queries
CREATE INDEX idx_game_stats_rating ON game_stats(rating DESC);
CREATE INDEX idx_game_stats_wins ON game_stats(wins DESC);

-- =====================================================
-- TABLE: game_history
-- Lịch sử các ván đấu
-- =====================================================
CREATE TABLE game_history (
  id SERIAL PRIMARY KEY,
  game_mode VARCHAR(20) NOT NULL, -- '2player', '3player', 'vs_bot'
  player1_id INTEGER,
  player2_id INTEGER,
  player3_id INTEGER,
  winner_id INTEGER,
  result VARCHAR(20) NOT NULL, -- 'win', 'draw'
  board_state TEXT, -- JSON string of final board
  moves_count INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0, -- in seconds
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (player3_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for user game history
CREATE INDEX idx_game_history_player1 ON game_history(player1_id);
CREATE INDEX idx_game_history_player2 ON game_history(player2_id);
CREATE INDEX idx_game_history_player3 ON game_history(player3_id);
CREATE INDEX idx_game_history_played_at ON game_history(played_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for game_stats table
CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Create a test user (password: 'test123')
INSERT INTO users (username, email, password_hash) VALUES
  ('test_player', 'test@example.com', '$2b$10$XQqZ9J4Y5Z8rU1wZ8rU1weU1wZ8rU1wZ8rU1wZ8rU1wZ8rU1wZ8rU');

-- Create stats for test user
INSERT INTO game_stats (user_id, wins, losses, draws, games_played) VALUES
  (1, 10, 5, 2, 17);

-- =====================================================
-- QUERIES FOR COMMON OPERATIONS
-- =====================================================

-- Get user profile with stats
-- SELECT u.*, gs.* FROM users u 
-- LEFT JOIN game_stats gs ON u.id = gs.user_id 
-- WHERE u.id = $1;

-- Get leaderboard (top 10)
-- SELECT u.username, gs.wins, gs.losses, gs.rating 
-- FROM game_stats gs 
-- JOIN users u ON gs.user_id = u.id 
-- ORDER BY gs.rating DESC LIMIT 10;

-- Get user game history
-- SELECT * FROM game_history 
-- WHERE player1_id = $1 OR player2_id = $1 OR player3_id = $1 
-- ORDER BY played_at DESC LIMIT 20;

