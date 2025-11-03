# ⚡ Import Dữ Liệu Mẫu - Hướng Dẫn Nhanh

## 🎯 3 Cách Import (Chọn 1 trong 3)

---

## 1️⃣ Cách Đơn Giản Nhất (Docker)

### Windows:
```cmd
import-seed-data.bat
```

### Mac/Linux:
```bash
chmod +x import-seed-data.sh
./import-seed-data.sh
```

✅ Xong! Dữ liệu đã được import.

---

## 2️⃣ Dùng npm (Nhanh gọn)

```bash
npm run db:seed
```

✅ Script tự động import và hiển thị kết quả.

---

## 3️⃣ Dùng psql (Thủ công)

### Docker đang chạy:
```bash
psql -h localhost -p 5432 -U postgres -d caro_game -f server/src/database/seed_data.sql
```
Password: `postgres123`

### PostgreSQL local:
```bash
psql -U postgres -d caro_game -f server/src/database/seed_data.sql
```

---

## 🎮 Test Account

Sau khi import, đăng nhập với:

```
Email: alice@example.com
Password: password123
```

Hoặc bất kỳ account nào:
- `bob@example.com`
- `charlie@example.com`
- `diana@example.com`
- `ethan@example.com`

Tất cả đều có password: **`password123`**

---

## 🔍 Kiểm Tra Đã Import Thành Công

### Cách 1: Vào psql
```bash
psql -U postgres -d caro_game
```

```sql
SELECT COUNT(*) FROM users;
-- Expected: 5
```

### Cách 2: Đăng nhập app
1. Mở http://localhost:3000
2. Đăng nhập với `alice@example.com` / `password123`
3. Xem profile → sẽ thấy stats (45 wins, rating 1450)

---

## 🗑️ Reset Dữ Liệu

Nếu muốn xóa và import lại:

```sql
TRUNCATE TABLE game_history, game_stats, users CASCADE;
```

Sau đó import lại bằng 1 trong 3 cách trên.

---

## 📚 Hướng Dẫn Chi Tiết

→ Xem file **`SEED_DATA_GUIDE.md`**

---

## ❓ Troubleshooting

### Lỗi "relation does not exist"
→ Chưa chạy schema:
```bash
psql -U postgres -d caro_game -f server/src/database/schema.sql
```

### Lỗi "duplicate key"
→ Data đã tồn tại, xóa trước:
```sql
TRUNCATE TABLE game_history, game_stats, users CASCADE;
```

### Không kết nối được
→ Check Docker đang chạy:
```bash
docker ps
```

---

**That's it! 🚀**

