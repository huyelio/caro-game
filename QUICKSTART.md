# 🚀 QUICKSTART - Game Cờ Caro Online

## 🐳 Chạy bằng Docker (Khuyến nghị - Đơn giản nhất!)

### Yêu cầu

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài đặt

### Chỉ cần 2 bước:

#### 1️⃣ Clone repo

```bash
git clone <repo-url>
cd btl
```

#### 2️⃣ Chạy Docker

```bash
docker-compose up
```

**Chờ khoảng 1-2 phút để build lần đầu**, sau đó:

- Mở browser: **http://localhost:3000**
- Game đã sẵn sàng! 🎮

#### Tắt Docker

```bash
# Nhấn Ctrl+C để dừng
# Hoặc chạy lệnh sau để dừng và xóa containers:
docker-compose down
```

---

## 💻 Chạy không dùng Docker (Cách truyền thống)

### Yêu cầu

- Node.js >= 18
- PostgreSQL đã cài đặt và chạy
- Tạo database tên `caro_game`

### 1️⃣ Cài đặt

```bash
npm install
```

### 2️⃣ Chạy server

```bash
npm start
```

### 3️⃣ Chơi game

- Mở browser: **http://localhost:3000**
- Mở thêm 1 tab mới hoặc cửa sổ mới
- Cả 2 nhấn "**Tìm trận đấu**"
- Bắt đầu chơi! 🎮

---

## 📝 Lưu ý

### Chơi trên 2 máy khác nhau

**Máy 1 (Server):**

```bash
npm start
```

→ Note lại IP của máy (ví dụ: `192.168.1.100`)

**Máy 2 (Client):**

- Mở browser: `http://192.168.1.100:3000`

### Xem IP của máy (Windows)

```bash
ipconfig
```

Tìm dòng `IPv4 Address`

### Xem IP của máy (Mac/Linux)

```bash
ifconfig
# hoặc
ip addr show
```

---

## 🎮 Cách chơi

1. **X đi trước**, O đi sau
2. Click vào ô để đánh dấu
3. Người nào tạo được **5 ô liên tiếp** (ngang, dọc, hoặc chéo) thắng
4. Hết ô mà không ai thắng → **Hòa**

---

## 🔧 Troubleshooting

### 🐳 Docker Troubleshooting

#### Lỗi "port already in use"

```bash
# Dừng tất cả containers
docker-compose down

# Kiểm tra port đang sử dụng
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3000
lsof -i :3001
```

#### Rebuild containers (sau khi sửa code)

```bash
# Rebuild và khởi động lại
docker-compose up --build

# Hoặc rebuild từng service cụ thể
docker-compose build server
docker-compose up
```

#### Xem logs

```bash
# Xem logs tất cả services
docker-compose logs

# Xem logs của service cụ thể
docker-compose logs server
docker-compose logs client
docker-compose logs postgres

# Xem logs realtime
docker-compose logs -f
```

#### Xóa toàn bộ (reset lại từ đầu)

```bash
docker-compose down -v  # -v để xóa cả volumes (database data)
docker-compose up --build
```

### 💻 Troubleshooting không dùng Docker

#### Port 3000 đã bị sử dụng?

```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

Hoặc đổi port:

```bash
PORT=4000 npm start
```

#### Không kết nối được?

1. Kiểm tra server đã chạy chưa
2. Kiểm tra firewall có block port không
3. Mở DevTools (F12) → Console để xem lỗi
4. Kiểm tra PostgreSQL đã chạy chưa

---

## 📚 Đọc thêm

### Tài liệu quan trọng:

- **APP_FLOW.md** - 🔥 **Luồng hoạt động chi tiết** từ đăng nhập đến kết thúc ván đấu (bao gồm các hàm được gọi)
- **API_REFERENCE.md** - 📡 API endpoints và Socket.IO events reference
- **DATASET_GUIDE.md** - 📊 Hướng dẫn import dataset_sample.csv (dữ liệu nhỏ gọn, logic)
- **SEED_DATA_GUIDE.md** - 🌱 Hướng dẫn import seed_data.sql (dữ liệu đầy đủ hơn)
- **DOCKER_README.md** - 🐳 Hướng dẫn Docker chi tiết
- **README.md** - 📖 Tổng quan về project

**Chúc bạn chơi vui vẻ! 🎉**
