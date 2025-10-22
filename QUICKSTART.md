# 🚀 QUICKSTART - Game Cờ Caro Online

## Chạy nhanh trong 3 bước

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

### Port 3000 đã bị sử dụng?

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

### Không kết nối được?

1. Kiểm tra server đã chạy chưa
2. Kiểm tra firewall có block port không
3. Mở DevTools (F12) → Console để xem lỗi

---

## 📚 Đọc thêm

Xem **README.md** để hiểu chi tiết về kiến trúc và cách hoạt động.

**Chúc bạn chơi vui vẻ! 🎉**
