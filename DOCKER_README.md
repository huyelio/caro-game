# 🐳 Hướng Dẫn Docker - Game Cờ Caro

## Tóm Tắt

Project này đã được cấu hình để chạy hoàn toàn bằng Docker Compose, bao gồm:

- **PostgreSQL** (Database)
- **Node.js Server** (Backend API + Socket.IO)
- **React Client** (Frontend)

## 📦 Yêu Cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt

## 🚀 Chạy Project

```bash
# Clone repo
git clone <repo-url>
cd btl

# Khởi động tất cả services
docker-compose up

# Chạy ở background (không hiện logs)
docker-compose up -d
```

Sau khoảng 1-2 phút, mở trình duyệt:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 🛑 Dừng Project

```bash
# Nhấn Ctrl+C (nếu chạy không có -d)

# Hoặc dừng bằng lệnh
docker-compose down

# Xóa cả database data
docker-compose down -v
```

## 🔨 Lệnh Hữu Ích

```bash
# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f server

# Rebuild sau khi sửa code
docker-compose up --build

# Xem containers đang chạy
docker ps

# Vào bên trong container
docker exec -it caro-server sh
```

## 📁 Cấu Trúc Docker

```
btl/
├── docker-compose.yml          # Cấu hình tất cả services
├── .dockerignore              # Files bỏ qua khi build
├── server/
│   ├── Dockerfile             # Build Node.js server
│   └── .dockerignore
└── client/
    ├── Dockerfile             # Build React app
    └── .dockerignore
```

## 🔧 Cấu Hình

### Database

- Host: `postgres` (trong Docker network)
- Port: `5432`
- Database: `caro_game`
- User: `postgres`
- Password: `postgres123`

### Ports

- PostgreSQL: `5432`
- Server: `3001`
- Client: `3000`

## ⚠️ Lưu Ý

1. **Lần đầu chạy** sẽ mất 1-2 phút để:

   - Download images (postgres, node)
   - Build server và client
   - Khởi tạo database với schema

2. **Database data** được lưu trong Docker volume:

   - Dữ liệu không mất khi restart
   - Chỉ mất khi chạy `docker-compose down -v`

3. **Hot reload** được bật:
   - Sửa code server → tự động restart
   - Sửa code client → tự động reload trình duyệt

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
docker-compose down
# Tắt chương trình đang dùng port 3000, 3001, hoặc 5432
```

### Database không khởi tạo

```bash
docker-compose down -v
docker-compose up --build
```

### Container không start

```bash
# Xem logs chi tiết
docker-compose logs

# Hoặc logs của service cụ thể
docker-compose logs postgres
docker-compose logs server
```

## 📚 Tài Liệu Khác

- **QUICKSTART.md** - Hướng dẫn chạy nhanh
- **README.md** - Tài liệu chi tiết về project
