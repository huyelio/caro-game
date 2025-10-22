# 📖 HƯỚNG DẪN CÀI ĐẶT NHANH

## Bước 1: Cài đặt Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

Hoặc dùng script:

```bash
npm run install:all
```

## Bước 2: Setup PostgreSQL Database

### Trên Windows:

1. Download PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Install và nhớ password của user `postgres`
3. Mở pgAdmin hoặc psql
4. Tạo database:
   ```sql
   CREATE DATABASE caro_game;
   ```

### Trên Mac:

```bash
brew install postgresql
brew services start postgresql
createdb caro_game
```

### Trên Linux:

```bash
sudo apt install postgresql
sudo service postgresql start
sudo -u postgres psql
CREATE DATABASE caro_game;
\q
```

## Bước 3: Chạy Database Schema

```bash
cd server
npm run db:setup
```

Hoặc manual:

```bash
psql -U postgres -d caro_game -f server/src/database/schema.sql
```

## Bước 4: Cấu hình Environment

Tạo file `server/.env`:

```env
PORT=3001
NODE_ENV=development

# PostgreSQL config
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caro_game
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT config
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:3000
```

## Bước 5: Chạy Development

### Option A: Chạy cả 2 cùng lúc (Recommended)

```bash
# Từ thư mục root
npm run dev
```

### Option B: Chạy riêng

Terminal 1 - Server:

```bash
cd server
npm run dev
# Server: http://localhost:3001
```

Terminal 2 - Client:

```bash
cd client
npm start
# Client: http://localhost:3000
```

## Bước 6: Test

1. Mở browser: `http://localhost:3000`
2. Đăng ký tài khoản mới
3. Chọn chế độ chơi:
   - **vs Bot**: Test ngay 1 mình
   - **2 Players**: Mở thêm 1 tab incognito để test matchmaking
   - **3 Players**: Mở 3 tabs

## 🔧 Troubleshooting

### Port đã bị sử dụng

**Server port 3001:**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**Client port 3000:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database connection failed

1. Check PostgreSQL đang chạy:

   ```bash
   # Windows
   services.msc  # Tìm PostgreSQL

   # Mac
   brew services list

   # Linux
   sudo service postgresql status
   ```

2. Check credentials trong `.env`
3. Test connection:
   ```bash
   psql -U postgres -d caro_game
   ```

### Module not found

```bash
# Clean install
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist

- [ ] Node.js ≥ 18.x installed
- [ ] PostgreSQL installed and running
- [ ] Database `caro_game` created
- [ ] Database schema imported
- [ ] `server/.env` file created with correct values
- [ ] Server dependencies installed
- [ ] Client dependencies installed
- [ ] Server running on port 3001
- [ ] Client running on port 3000
- [ ] Can register new user
- [ ] Can login
- [ ] Can play vs bot
- [ ] Can matchmake with another player

## 🎉 Xong!

Bây giờ bạn có thể:

- Chơi game caro với bạn bè
- Test AI bot
- Xem profile và statistics
- Check leaderboard

**Enjoy! 🎮**
