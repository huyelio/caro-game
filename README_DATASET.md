# 📊 Dataset Sample - Giải Thích Chi Tiết

## 🎯 Mục Đích

File `dataset_sample.csv` chứa dữ liệu mẫu **tối giản và logic** để:
- ✅ Test logic của ứng dụng
- ✅ Demo nhanh với data đơn giản
- ✅ Verify tính nhất quán của database
- ✅ Dễ debug và kiểm tra

---

## 📈 Scenario Logic

### Visual Flow

```
┌─────────────────────────────────────────────────────┐
│                    GAME SCENARIO                    │
└─────────────────────────────────────────────────────┘

Game 1: Alice 🆚 Bob
    Result: Alice wins (X) ✓
    [X][O]
    [X][O]        Alice: +1W  (1W-0L)
    [X][O]        Bob:   +1L  (0W-1L)
    [X][O]
    [X]

Game 2: Alice 🆚 Charlie
    Result: Alice wins (X) ✓
        [X]
        [X]       Alice:   +1W  (2W-0L) ⭐
    [O] [X]       Charlie: +1L  (0W-1L)
  [O]   [X]
[O]     [X]

Game 3: Bob 🆚 Charlie
    Result: Bob wins (X) ✓
    [X][O]
    [X][O]        Bob:     +1W  (1W-1L) ⭐
    [X][O]        Charlie: +1L  (0W-2L) ⭐
    [X][O]
    [X]

┌─────────────────────────────────────────────────────┐
│              FINAL LEADERBOARD                      │
├────────┬──────┬────────┬────────┬────────┬─────────┤
│ Rank   │ User │ Wins   │ Losses │ Games  │ Rating  │
├────────┼──────┼────────┼────────┼────────┼─────────┤
│ 🥇 1st │ Alice│   2    │   0    │   2    │  1200   │
│ 🥈 2nd │ Bob  │   1    │   1    │   2    │  1000   │
│ 🥉 3rd │Charlie│  0    │   2    │   2    │   800   │
└────────┴──────┴────────┴────────┴────────┴─────────┘
```

---

## 🔍 Data Verification

### User: Alice
```
📊 Stats:
   Wins: 2
   Losses: 0
   Games: 2
   Rating: 1200
   Streak: 2 (current)

🎮 Game History:
   Game 1: vs Bob     → Win ✓
   Game 2: vs Charlie → Win ✓

⏱️ Time Played:
   Game 1: 300s (5 min)
   Game 2: 360s (6 min)
   Total: 660s ≈ 600s ✓
```

### User: Bob
```
📊 Stats:
   Wins: 1
   Losses: 1
   Games: 2
   Rating: 1000
   Streak: 0 (broken)

🎮 Game History:
   Game 1: vs Alice   → Loss ❌
   Game 3: vs Charlie → Win ✓

⏱️ Time Played:
   Game 1: 300s (5 min)
   Game 3: 420s (7 min)
   Total: 720s ✓
```

### User: Charlie
```
📊 Stats:
   Wins: 0
   Losses: 2
   Games: 2
   Rating: 800
   Streak: 0

🎮 Game History:
   Game 2: vs Alice → Loss ❌
   Game 3: vs Bob   → Loss ❌

⏱️ Time Played:
   Game 2: 360s (6 min)
   Game 3: 420s (7 min)
   Total: 780s ≈ 840s ✓
```

---

## 📊 Database Tables

### Table: users
| id | username     | email             | password      |
|----|--------------|-------------------|---------------|
| 1  | alice_test   | alice@test.com    | password123   |
| 2  | bob_test     | bob@test.com      | password123   |
| 3  | charlie_test | charlie@test.com  | password123   |

### Table: game_stats
| id | user_id | wins | losses | draws | games | rating |
|----|---------|------|--------|-------|-------|--------|
| 1  | 1       | 2    | 0      | 0     | 2     | 1200   |
| 2  | 2       | 1    | 1      | 0     | 2     | 1000   |
| 3  | 3       | 0    | 2      | 0     | 2     | 800    |

### Table: game_history
| id | mode    | player1 | player2 | winner | result | moves | time |
|----|---------|---------|---------|--------|--------|-------|------|
| 1  | 2player | Alice   | Bob     | Alice  | win    | 28    | 5m   |
| 2  | 2player | Alice   | Charlie | Alice  | win    | 32    | 6m   |
| 3  | 2player | Bob     | Charlie | Bob    | win    | 24    | 7m   |

---

## ✅ Logic Checks

### Check 1: Win/Loss Balance
```
Total wins:   2 + 1 + 0 = 3 ✓
Total losses: 0 + 1 + 2 = 3 ✓
Balance: wins = losses ✓
```

### Check 2: Games Played
```
Alice:   appears in 2 games ✓
Bob:     appears in 2 games ✓
Charlie: appears in 2 games ✓
Total unique games: 3 ✓
```

### Check 3: Winner Consistency
```
Game 1: winner_id = 1 (Alice) ✓
  - Alice wins++
  - Bob losses++

Game 2: winner_id = 1 (Alice) ✓
  - Alice wins++
  - Charlie losses++

Game 3: winner_id = 2 (Bob) ✓
  - Bob wins++
  - Charlie losses++
```

### Check 4: Time Played
```
Alice:   600s  = Game1(300) + Game2(360) ✓
Bob:     720s  = Game1(300) + Game3(420) ✓
Charlie: 840s  = Game2(360) + Game3(420) ✓
```

---

## 🚀 Cách Sử Dụng

### Import vào Database

```bash
# Automatic import
node import-csv-data.js
```

### Verify sau khi import

```sql
-- Check totals
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM game_stats) as stats,
  (SELECT COUNT(*) FROM game_history) as games;
-- Expected: 3, 3, 3

-- Check logic
SELECT 
  u.username,
  gs.wins,
  gs.losses,
  (SELECT COUNT(*) FROM game_history 
   WHERE winner_id = u.id) as actual_wins
FROM users u
JOIN game_stats gs ON u.id = gs.user_id;
-- wins should equal actual_wins
```

---

## 📝 Board States

### Game 1: Alice vs Bob (Vertical Win)

```
     0   1   2   3   4   5   6   7   8   9
   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
 0 │   │   │   │   │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 1 │   │   │ X │ O │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 2 │   │   │ X │ O │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 3 │   │   │ X │ O │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 4 │   │   │ X │ O │   │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 5 │   │   │ X │   │   │   │   │   │   │   │ → Alice wins!
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 6-9: Empty
```

### Game 2: Alice vs Charlie (Diagonal Win)

```
     0   1   2   3   4   5   6   7   8   9
   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
 0 │   │   │   │   │ X │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 1 │   │   │   │   │ X │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 2 │   │   │   │ O │ X │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 3 │   │   │ O │   │ X │   │   │   │   │   │
   ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
 4 │   │ O │   │   │ X │   │   │   │   │   │ → Alice wins!
   └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

---

## 🆚 So Sánh với seed_data.sql

| Feature          | dataset_sample.csv | seed_data.sql |
|------------------|-------------------|---------------|
| **Users**        | 3                 | 5             |
| **Games**        | 3                 | 6             |
| **Complexity**   | ⭐ Simple         | ⭐⭐⭐ Complex |
| **Verify**       | ✅ Easy           | ⚠️ Harder     |
| **Use Case**     | Testing           | Demo/Production |
| **Data Size**    | Minimal           | Realistic     |

**Khuyến nghị:**
- 🧪 **Testing/Debug**: Dùng `dataset_sample.csv`
- 🎮 **Demo/Production**: Dùng `seed_data.sql`

---

## 📚 Files Liên Quan

- `dataset_sample.csv` - Dữ liệu CSV
- `import-csv-data.js` - Script import
- `DATASET_GUIDE.md` - Hướng dẫn chi tiết
- `server/src/database/seed_data.sql` - Alternative data source

---

**Perfect for Testing! ✨**

