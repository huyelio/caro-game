# 📊 Hướng Dẫn Sử Dụng dataset_sample.csv

## 📁 File dataset_sample.csv

File này chứa dữ liệu mẫu **nhỏ gọn và logic** cho 3 bảng:
- **users** (3 users)
- **game_stats** (3 records)
- **game_history** (3 games)

---

## 📈 Scenario Logic

### Dữ liệu được thiết kế logic như sau:

| User   | Email             | Wins | Losses | Games | Rating |
|--------|-------------------|------|--------|-------|--------|
| Alice  | alice@test.com    | 2    | 0      | 2     | 1200   |
| Bob    | bob@test.com      | 1    | 1      | 2     | 1000   |
| Charlie| charlie@test.com  | 0    | 2      | 2     | 800    |

### Game History:

1. **Game 1**: Alice vs Bob → **Alice wins** ✓
   - Alice: +1 win
   - Bob: +1 loss

2. **Game 2**: Alice vs Charlie → **Alice wins** ✓
   - Alice: +1 win (total 2 wins)
   - Charlie: +1 loss

3. **Game 3**: Bob vs Charlie → **Bob wins** ✓
   - Bob: +1 win (total 1 win, 1 loss)
   - Charlie: +1 loss (total 2 losses)

### ✅ Verification:
- Alice: 2 games played, 2 wins, 0 losses ✓
- Bob: 2 games played, 1 win, 1 loss ✓
- Charlie: 2 games played, 0 wins, 2 losses ✓
- Total time played được tính từ duration của các games ✓

---

## 🚀 Cách Import

### Cách 1: Dùng Node.js script (Recommended)

```bash
# Từ root project
node import-csv-data.js
```

Script sẽ:
1. Parse file CSV
2. Xóa dữ liệu cũ
3. Import users → game_stats → game_history
4. Hiển thị summary và bảng kết quả

### Cách 2: Dùng SQL thủ công

Mở file `dataset_sample.csv`, copy từng section và chạy SQL:

```sql
-- 1. Insert users
INSERT INTO users (id, username, email, password_hash, created_at, last_login) VALUES
  (1, 'alice_test', 'alice@test.com', '$2b$10$...', '2024-11-01 10:00:00', '2024-11-02 09:00:00'),
  (2, 'bob_test', 'bob@test.com', '$2b$10$...', '2024-11-01 11:00:00', '2024-11-02 08:00:00'),
  (3, 'charlie_test', 'charlie@test.com', '$2b$10$...', '2024-11-01 12:00:00', '2024-11-02 07:00:00');

-- 2. Insert game_stats
INSERT INTO game_stats (id, user_id, wins, losses, draws, games_played, total_time_played, highest_streak, current_streak, rating) VALUES
  (1, 1, 2, 0, 0, 2, 600, 2, 2, 1200),
  (2, 2, 1, 1, 0, 2, 720, 1, 0, 1000),
  (3, 3, 0, 2, 0, 2, 840, 0, 0, 800);

-- 3. Insert game_history (see CSV for full board_state)
-- ...
```

### Cách 3: Dùng seed_data.sql (Dữ liệu lớn hơn)

Nếu cần nhiều data hơn (5 users, 6 games):

```bash
npm run db:seed
```

---

## 🧪 Test Dữ Liệu

### 1. Kiểm tra import thành công

```sql
-- Check users
SELECT COUNT(*) FROM users;
-- Expected: 3

-- Check stats
SELECT * FROM game_stats ORDER BY rating DESC;

-- Check games
SELECT 
  gh.id,
  u1.username as player1,
  u2.username as player2,
  uw.username as winner
FROM game_history gh
JOIN users u1 ON gh.player1_id = u1.id
LEFT JOIN users u2 ON gh.player2_id = u2.id
LEFT JOIN users uw ON gh.winner_id = uw.id;
```

### 2. Verify logic

```sql
-- Alice should have 2 wins
SELECT username, wins, losses 
FROM users u 
JOIN game_stats gs ON u.id = gs.user_id 
WHERE u.username = 'alice_test';
-- Expected: 2 wins, 0 losses

-- Count games where Alice is winner
SELECT COUNT(*) 
FROM game_history 
WHERE winner_id = 1;
-- Expected: 2
```

### 3. Test login

Mở app và đăng nhập:
- Email: `alice@test.com`
- Password: `password123`

Xem profile → Sẽ thấy: 2 wins, 0 losses, rating 1200

---

## 📊 So Sánh với seed_data.sql

| Feature | dataset_sample.csv | seed_data.sql |
|---------|-------------------|---------------|
| Users | 3 | 5 |
| Games | 3 | 6 |
| Data size | Nhỏ, đơn giản | Lớn hơn, đầy đủ |
| Use case | Test logic, demo nhanh | Production-like data |
| Complexity | Đơn giản, dễ verify | Phức tạp hơn |

**Khuyến nghị:**
- Dùng `dataset_sample.csv` khi cần test logic nhanh
- Dùng `seed_data.sql` khi cần demo với data đầy đủ

---

## 🗑️ Reset Data

Trước khi import lại:

```sql
TRUNCATE TABLE game_history CASCADE;
TRUNCATE TABLE game_stats CASCADE;
TRUNCATE TABLE users CASCADE;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE game_stats_id_seq RESTART WITH 1;
ALTER SEQUENCE game_history_id_seq RESTART WITH 1;
```

Hoặc dùng script:
```bash
node import-csv-data.js
```
Script tự động clear data trước khi import.

---

## 📝 Format CSV

File sử dụng format:

```
# Comment lines start with #
# Section headers: # ============ TABLE: table_name ============

# Users section
id,username,email,password_hash,created_at,last_login
1,alice_test,...

# Game stats section
id,user_id,wins,losses,...
1,1,2,0,...

# Game history section
id,game_mode,player1_id,...
1,2player,1,...
```

---

## ✅ Test Checklist

- [ ] Import data thành công
- [ ] 3 users tồn tại
- [ ] Stats match với games (Alice 2W, Bob 1W1L, Charlie 2L)
- [ ] Đăng nhập được với alice@test.com
- [ ] Profile hiển thị đúng stats
- [ ] Leaderboard hiển thị đúng thứ tự (Alice > Bob > Charlie)

---

## 🔧 Troubleshooting

### Lỗi parsing CSV
→ Check file encoding (UTF-8)

### Lỗi foreign key constraint
→ Import đúng thứ tự: users → game_stats → game_history

### Data không match
→ Xem lại section VERIFICATION trong file CSV

---

**Happy Testing! 🎮**

