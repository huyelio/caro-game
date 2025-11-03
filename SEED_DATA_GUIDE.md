# 📊 Hướng Dẫn Import Dữ Liệu Mẫu Vào Database

## 🎯 Mục Đích
Import dữ liệu mẫu để test và demo ứng dụng với:
- **5 users** (alice, bob, charlie, diana, ethan)
- **5 game stats** records
- **6 game history** records

Tất cả test users có **password: `password123`**

---

## 🐳 Cách 1: Import với Docker (Khuyến nghị)

### A. Import khi khởi động Docker lần đầu

File `seed_data.sql` sẽ tự động chạy nếu bạn đặt nó vào folder init:

```bash
# 1. Copy file seed vào folder init của postgres
mkdir -p postgres-init
cp server/src/database/seed_data.sql postgres-init/

# 2. Update docker-compose.yml (thêm volume mount)
# Thêm dòng này vào service postgres:
#   - ./postgres-init:/docker-entrypoint-initdb.d-seed

# 3. Khởi động Docker
docker-compose up
```

### B. Import vào database đang chạy trong Docker

```bash
# 1. Check container đang chạy
docker ps

# 2. Copy file seed vào container
docker cp server/src/database/seed_data.sql caro-postgres:/tmp/seed_data.sql

# 3. Chạy file SQL trong container
docker exec -i caro-postgres psql -U postgres -d caro_game -f /tmp/seed_data.sql

# 4. Verify data đã được import
docker exec -i caro-postgres psql -U postgres -d caro_game -c "SELECT COUNT(*) FROM users;"
```

### C. Import bằng psql từ máy host (Docker đang chạy)

```bash
# Import trực tiếp
psql -h localhost -p 5432 -U postgres -d caro_game -f server/src/database/seed_data.sql

# Nếu cần nhập password: postgres123
```

---

## 💻 Cách 2: Import với PostgreSQL Local (Không dùng Docker)

### Yêu cầu:
- PostgreSQL đã cài đặt
- Database `caro_game` đã được tạo
- Schema đã được chạy (file `schema.sql`)

### Bước 1: Mở Terminal/CMD

**Windows (PowerShell):**
```powershell
cd D:\School\LapTrinhMang\btl
```

**Mac/Linux:**
```bash
cd /path/to/btl
```

### Bước 2: Import dữ liệu

**Cách A: Dùng psql command**
```bash
psql -U postgres -d caro_game -f server/src/database/seed_data.sql
```

**Cách B: Dùng psql interactive**
```bash
# 1. Kết nối database
psql -U postgres -d caro_game

# 2. Chạy file SQL
\i server/src/database/seed_data.sql

# 3. Thoát
\q
```

**Cách C: Dùng pgAdmin (GUI)**
1. Mở pgAdmin
2. Kết nối đến server PostgreSQL
3. Chọn database `caro_game`
4. Tools → Query Tool
5. File → Open → Chọn `server/src/database/seed_data.sql`
6. Nhấn Execute (⚡ icon)

---

## 🔍 Verify Dữ Liệu Đã Import

### Kiểm tra số lượng records

```sql
-- Check users
SELECT COUNT(*) as total_users FROM users;
-- Expected: 5

-- Check game stats
SELECT COUNT(*) as total_stats FROM game_stats;
-- Expected: 5

-- Check game history
SELECT COUNT(*) as total_games FROM game_history;
-- Expected: 6
```

### Xem bảng xếp hạng

```sql
SELECT 
  u.username, 
  gs.wins, 
  gs.losses, 
  gs.draws,
  gs.rating 
FROM users u 
JOIN game_stats gs ON u.id = gs.user_id 
ORDER BY gs.rating DESC;
```

**Kết quả mong đợi:**
```
   username    | wins | losses | draws | rating 
---------------+------+--------+-------+--------
 charlie_le    |   52 |     15 |     3 |   1520
 alice_nguyen  |   45 |     20 |     5 |   1450
 bob_tran      |   38 |     25 |     7 |   1380
 diana_pham    |   30 |     30 |    10 |   1250
 ethan_vo      |   25 |     35 |    10 |   1180
```

### Xem lịch sử game gần đây

```sql
SELECT 
  gh.game_mode,
  u1.username as player1,
  u2.username as player2,
  u3.username as player3,
  uw.username as winner,
  gh.result,
  gh.played_at
FROM game_history gh
LEFT JOIN users u1 ON gh.player1_id = u1.id
LEFT JOIN users u2 ON gh.player2_id = u2.id
LEFT JOIN users u3 ON gh.player3_id = u3.id
LEFT JOIN users uw ON gh.winner_id = uw.id
ORDER BY gh.played_at DESC
LIMIT 5;
```

---

## 🧪 Test với Dữ Liệu Mẫu

### 1. Đăng nhập với test account

Mở app tại http://localhost:3000, đăng nhập với:

```
Email: alice@example.com
Password: password123
```

Hoặc bất kỳ account nào:
- `bob@example.com` / `password123`
- `charlie@example.com` / `password123`
- `diana@example.com` / `password123`
- `ethan@vo` / `password123`

### 2. Xem Profile

Sau khi đăng nhập:
- Nhấn "Thông tin cá nhân"
- Sẽ thấy stats: wins, losses, rating, streak

### 3. Xem Leaderboard

Bảng xếp hạng sẽ hiển thị top 5 players với ratings

---

## 🗑️ Xóa Dữ Liệu Mẫu (Reset)

Nếu muốn xóa hết dữ liệu và bắt đầu lại:

```sql
-- Xóa tất cả data
TRUNCATE TABLE game_history CASCADE;
TRUNCATE TABLE game_stats CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset auto-increment IDs
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE game_stats_id_seq RESTART WITH 1;
ALTER SEQUENCE game_history_id_seq RESTART WITH 1;
```

Hoặc drop và tạo lại database:

```bash
# Drop database
psql -U postgres -c "DROP DATABASE caro_game;"

# Tạo lại
psql -U postgres -c "CREATE DATABASE caro_game;"

# Chạy lại schema
psql -U postgres -d caro_game -f server/src/database/schema.sql

# Import seed data
psql -U postgres -d caro_game -f server/src/database/seed_data.sql
```

---

## 📝 Dữ Liệu Mẫu Chi Tiết

### Users (5 accounts)

| ID | Username      | Email               | Password     | Rating |
|----|---------------|---------------------|--------------|--------|
| 1  | alice_nguyen  | alice@example.com   | password123  | 1450   |
| 2  | bob_tran      | bob@example.com     | password123  | 1380   |
| 3  | charlie_le    | charlie@example.com | password123  | 1520   |
| 4  | diana_pham    | diana@example.com   | password123  | 1250   |
| 5  | ethan_vo      | ethan@example.com   | password123  | 1180   |

### Game Stats

| User   | Wins | Losses | Draws | Games | Rating | Streak |
|--------|------|--------|-------|-------|--------|--------|
| alice  | 45   | 20     | 5     | 70    | 1450   | 3      |
| bob    | 38   | 25     | 7     | 70    | 1380   | 0      |
| charlie| 52   | 15     | 3     | 70    | 1520   | 5      |
| diana  | 30   | 30     | 10    | 70    | 1250   | 2      |
| ethan  | 25   | 35     | 10    | 70    | 1180   | 1      |

### Game History (6 games)

1. **alice vs bob** (2player) → alice wins
2. **charlie vs diana** (2player) → charlie wins
3. **bob vs ethan** (2player) → draw
4. **alice vs charlie vs diana** (3player) → charlie wins
5. **bob vs ethan** (2player) → bob wins
6. **alice vs bot** (vs_bot) → alice wins

---

## 🔧 Troubleshooting

### Lỗi: "relation does not exist"

→ Chưa chạy schema. Chạy trước:
```bash
psql -U postgres -d caro_game -f server/src/database/schema.sql
```

### Lỗi: "duplicate key value"

→ Data đã tồn tại. Xóa trước:
```sql
TRUNCATE TABLE game_history, game_stats, users CASCADE;
```

### Lỗi: "password authentication failed"

→ Sai password PostgreSQL. Với Docker, default là `postgres123`

### Không kết nối được database

**Docker:**
```bash
docker ps  # Check postgres container đang chạy
docker logs caro-postgres  # Xem logs
```

**Local:**
```bash
# Windows
pg_ctl status

# Mac/Linux
sudo systemctl status postgresql
```

---

## 📚 File Liên Quan

- `server/src/database/schema.sql` - Database schema
- `server/src/database/seed_data.sql` - Dữ liệu mẫu
- `server/src/database/setup.js` - Script tự động setup DB
- `docker-compose.yml` - Docker configuration

---

**Happy Testing! 🎮**

