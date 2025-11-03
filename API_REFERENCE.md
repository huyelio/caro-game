# 📡 API & Socket.IO Reference

## 🌐 REST API Endpoints

### Base URL

```
http://localhost:3001/api
```

---

### 🔐 Authentication Endpoints

#### 1. Đăng Ký

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response 201:**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com"
  }
}
```

**Error 400:**

```json
{
  "error": "Username or email already exists"
}
```

---

#### 2. Đăng Nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response 200:**

```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com"
  }
}
```

**Error 401:**

```json
{
  "error": "Invalid email or password"
}
```

---

#### 3. Lấy Thông Tin Profile (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response 200:**

```json
{
  "id": 1,
  "username": "player1",
  "email": "player1@example.com",
  "avatar_url": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "wins": 10,
  "losses": 5,
  "draws": 2,
  "games_played": 17,
  "highest_streak": 5,
  "current_streak": 3,
  "rating": 1250
}
```

---

#### 4. Lấy Bảng Xếp Hạng

```http
GET /api/auth/leaderboard?limit=10
```

**Response 200:**

```json
[
  {
    "id": 1,
    "username": "player1",
    "avatar_url": null,
    "wins": 100,
    "losses": 20,
    "draws": 5,
    "rating": 1500,
    "highest_streak": 15
  }
  // ... more players
]
```

---

#### 5. Health Check

```http
GET /api/health
```

**Response 200:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

---

## 🔌 Socket.IO Events

### Connection URL

```
http://localhost:3001
```

### Client Config

```javascript
io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

---

## 📤 Client → Server Events

### 1. authenticate

Gửi sau khi kết nối thành công để xác thực user

```javascript
socket.emit("authenticate", {
  userId: 123,
});
```

---

### 2. findGame

Tìm trận đấu theo mode

```javascript
socket.emit("findGame", {
  mode: "2player" | "3player" | "vs_bot",
});
```

**Server Response:**

- `waiting` - Nếu chưa đủ người
- `gameStart` - Nếu đủ người hoặc vs_bot

---

### 3. makeMove

Thực hiện nước đi

```javascript
socket.emit("makeMove", {
  row: 0 - 9,
  col: 0 - 9,
});
```

**Server Response:**

- `updateBoard` - Cập nhật bàn cờ
- `gameOver` - Nếu game kết thúc
- `error` - Nếu nước đi không hợp lệ

---

### 4. leaveGame

Rời khỏi game hiện tại

```javascript
socket.emit("leaveGame");
```

**Server Response:**

- `playerLeft` - Thông báo cho các player khác

---

### 5. getStats

Lấy thống kê server (optional)

```javascript
socket.emit("getStats");
```

**Server Response:**

```javascript
socket.on("stats", (data) => {
  // data: { activeRooms, waiting2Player, waiting3Player, totalPlayers }
});
```

---

## 📥 Server → Client Events

### 1. waiting

Đang chờ đủ người chơi

```javascript
socket.on("waiting", (data) => {
  console.log(data.message); // "Waiting for 1 more player(s)..."
  console.log(data.queueSize); // 1
});
```

**Data:**

```json
{
  "message": "Waiting for 1 more player(s)...",
  "queueSize": 1
}
```

---

### 2. gameStart

Game bắt đầu

```javascript
socket.on("gameStart", (data) => {
  // Setup game
});
```

**Data:**

```json
{
  "roomId": "room_1234567890_abc123",
  "mode": "2player",
  "yourSymbol": "X",
  "players": [
    { "symbol": "X" },
    { "symbol": "O" }
  ],
  "currentTurn": "X",
  "board": [[null, null, ...], ...],
  "message": "Game started! You are X"
}
```

---

### 3. updateBoard

Cập nhật bàn cờ sau mỗi nước đi

```javascript
socket.on("updateBoard", (data) => {
  // Update game state
});
```

**Data:**

```json
{
  "board": [[null, "X", ...], ...],
  "row": 0,
  "col": 1,
  "currentTurn": "O"
}
```

---

### 4. gameOver

Game kết thúc

```javascript
socket.on("gameOver", (data) => {
  // Show result
});
```

**Data:**

```json
{
  "winner": "X" | "O" | "V" | "draw",
  "message": "X wins! 🎉"
}
```

---

### 5. playerLeft

Có người chơi rời đi

```javascript
socket.on("playerLeft", (data) => {
  // Handle player disconnect
});
```

**Data:**

```json
{
  "message": "Opponent disconnected"
}
```

---

### 6. error

Thông báo lỗi

```javascript
socket.on("error", (data) => {
  alert(data.message);
});
```

**Data:**

```json
{
  "message": "Not your turn"
}
```

Các lỗi có thể:

- "You are not in a game"
- "Not your turn"
- "Invalid move"

---

## 🎮 Game Flow Example

### Ví dụ: 2 Player Game

```javascript
// === PLAYER 1 ===
socket.emit("findGame", { mode: "2player" });
// → Server: waiting

// === PLAYER 2 ===
socket.emit("findGame", { mode: "2player" });
// → Server: gameStart (to both)

// === PLAYER 1 (X) ===
socket.emit("makeMove", { row: 5, col: 5 });
// → Server: updateBoard (to both)
// → currentTurn = "O"

// === PLAYER 2 (O) ===
socket.emit("makeMove", { row: 5, col: 6 });
// → Server: updateBoard (to both)
// → currentTurn = "X"

// ... game continues ...

// === PLAYER 1 wins ===
socket.emit("makeMove", { row: 5, col: 9 }); // 5 in a row!
// → Server: updateBoard
// → Server: gameOver { winner: "X", message: "X wins! 🎉" }
```

---

## 🤖 Bot Game Flow

```javascript
// === PLAYER ===
socket.emit("findGame", { mode: "vs_bot" });
// → Server: gameStart (instant)

// === PLAYER (X) ===
socket.emit("makeMove", { row: 5, col: 5 });
// → Server: updateBoard (currentTurn = "O")

// === BOT (O) - Auto play after 500ms ===
// (Server tự động)
// → Server: updateBoard (currentTurn = "X")
// → Bot's move: { row: 5, col: 6 }

// ... game continues ...
```

---

## 🔒 Authentication Flow

```javascript
// 1. User đăng ký/đăng nhập
const response = await axios.post("/api/auth/login", { email, password });
const { token, user } = response.data;

// 2. Lưu token
localStorage.setItem("token", token);

// 3. Kết nối Socket.IO
const socket = io("http://localhost:3001");

// 4. Authenticate socket
socket.on("connect", () => {
  socket.emit("authenticate", { userId: user.id });
});

// 5. Tất cả API requests tự động thêm token
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

---

## 🗄️ Database Schema Quick Reference

### users table

```sql
id, username, email, password_hash, avatar_url,
created_at, updated_at, last_login
```

### game_stats table

```sql
id, user_id, wins, losses, draws, games_played,
total_time_played, highest_streak, current_streak, rating
```

### game_history table

```sql
id, game_mode, player1_id, player2_id, player3_id,
winner_id, result, board_state, moves_count, duration, played_at
```

---

## 📝 Notes

- **JWT Token** expires sau 7 ngày (configurable)
- **Socket.IO** auto-reconnect nếu mất kết nối
- **Board size**: 10x10
- **Win condition**: 5 quân liên tiếp
- **Symbols**: X, O, V (cho 3 player)
- **Bot delay**: 500ms

---

**Để biết flow chi tiết, xem file `APP_FLOW.md`**
