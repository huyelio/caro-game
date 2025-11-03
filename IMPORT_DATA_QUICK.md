# ⚡ Import Dữ Liệu - Quick Reference

## 🎯 2 Loại Dữ Liệu Mẫu

### 1. 📊 dataset_sample.csv (Nhỏ gọn, Logic)
```
3 users, 3 games - Dữ liệu tối giản để test
```
**Import:**
```bash
node import-csv-data.js
```

### 2. 🌱 seed_data.sql (Đầy đủ hơn)
```
5 users, 6 games - Dữ liệu realistic cho demo
```
**Import:**
```bash
npm run db:seed
```

---

## 📊 dataset_sample.csv

### Scenario:
- **Alice**: 2 wins, 0 losses (Rating 1200) 🥇
- **Bob**: 1 win, 1 loss (Rating 1000) 🥈  
- **Charlie**: 0 wins, 2 losses (Rating 800) 🥉

### Games:
1. Alice beats Bob
2. Alice beats Charlie
3. Bob beats Charlie

### Test Account:
```
Email: alice@test.com
Password: password123
```

### Chi tiết:
→ `DATASET_GUIDE.md` hoặc `README_DATASET.md`

---

## 🌱 seed_data.sql

### Scenario:
- **5 users** (alice, bob, charlie, diana, ethan)
- **6 games** (mix of 2player, 3player, vs_bot)
- Realistic stats (45W-20L, 38W-25L, etc.)

### Test Accounts:
```
alice@example.com    / password123
bob@example.com      / password123
charlie@example.com  / password123
diana@example.com    / password123
ethan@example.com    / password123
```

### Chi tiết:
→ `SEED_DATA_GUIDE.md` hoặc `QUICK_IMPORT_DATA.md`

---

## 🤔 Nên Dùng Loại Nào?

| Tình huống | Dùng |
|------------|------|
| 🧪 Test logic nhanh | `dataset_sample.csv` |
| 🐛 Debug một feature | `dataset_sample.csv` |
| 🎮 Demo cho người khác | `seed_data.sql` |
| 📊 Xem UI với nhiều data | `seed_data.sql` |
| ✅ Verify database logic | `dataset_sample.csv` |

---

## 🚀 Quick Commands

```bash
# Dataset sample (3 users, 3 games)
node import-csv-data.js

# Seed data (5 users, 6 games)
npm run db:seed

# Hoặc với Docker
./import-seed-data.bat    # Windows
./import-seed-data.sh     # Mac/Linux
```

---

## 📚 Tài Liệu Đầy Đủ

1. **DATASET_GUIDE.md** - Hướng dẫn dataset_sample.csv
2. **README_DATASET.md** - Giải thích chi tiết scenario
3. **SEED_DATA_GUIDE.md** - Hướng dẫn seed_data.sql
4. **QUICK_IMPORT_DATA.md** - 3 cách import nhanh

---

**Choose what fits your need! 🎯**

