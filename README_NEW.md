# 🎮 CARO GAME PLATFORM - ADVANCED VERSION 2.0

Nền tảng game Cờ Caro online hoàn chỉnh với chế độ nhiều người chơi, AI thông minh, xác thực người dùng, và thống kê chi tiết.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

## ✨ TÍNH NĂNG CHÍNH

### 🎮 Game Modes

- **2 Players**: Chơi 1v1 classic với matchmaking tự động
- **3 Players**: Chế độ 3 người chơi độc đáo (X vs O vs V)
- **vs Bot AI**: Chơi với AI thông minh với strategy win/block/attack

### 🔐 Authentication & User System

- Đăng ký & đăng nhập với JWT
- Profile cá nhân với avatar
- Lưu lịch sử trận đấu
- Bảng xếp hạng (Leaderboard)

### 📊 Statistics & Tracking

- Win/Loss/Draw ratio
- Tổng số trận đã chơi
- Win rate
- Highest winning streak
- ELO rating system

### 🤖 Intelligent Bot AI

- **Priority 1**: Tìm nước thắng ngay lập tức
- **Priority 2**: Chặn đối thủ (block 4-in-a-row)
- **Priority 3**: Tạo threats (attack 3-in-a-row)
- **Priority 4**: Strategic positioning
- **Priority 5**: Random valid moves

### 🎨 Modern UI/UX

- React-based SPA với routing
- Responsive design (mobile & desktop)
- Real-time updates via Socket.IO
- Smooth animations & transitions
- Dark theme với gradients

---

## 🏗 KIẾN TRÚC HỆ THỐNG

### Tech Stack

**Backend:**

- Node.js + Express.js
- Socket.IO (real-time communication)
- PostgreSQL (database)
- bcrypt (password hashing)
- JWT (authentication)

**Frontend:**

- React 18
- React Router v6
- Socket.IO Client
- Axios (HTTP client)

### Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  CLIENT (React)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Home    │  │  Game    │  │ Profile  │     │
│  │  View    │  │  View    │  │  View    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│         │              │              │         │
│         └──────────────┴──────────────┘         │
│                    │                             │
│         ┌──────────┴───────────┐               │
│         │                      │               │
│    Socket.IO              REST API             │
│      Client                 (axios)            │
└─────────┬────────────────────┬────────────────┘
          │                    │
          │                    │
┌─────────▼────────────────────▼────────────────┐
│            SERVER (Node.js + Express)         │
│  ┌────────────────┐  ┌───────────────────┐   │
│  │  Socket.IO     │  │   REST API        │   │
│  │  Handlers      │  │   - Auth          │   │
│  │  - Matchmaking │  │   - Profile       │   │
│  │  - Game Logic  │  │   - Leaderboard   │   │
│  │  - Bot AI      │  └───────────────────┘   │
│  └────────────────┘                           │
│                    │                           │
│         ┌──────────▼──────────┐               │
│         │  Game Manager       │               │
│         │  - Rooms            │               │
│         │  - Players          │               │
│         │  - Turn Logic       │               │
│         └─────────────────────┘               │
└─────────────────────┬─────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │   PostgreSQL DB       │
          │  ┌─────────────────┐  │
          │  │  users          │  │
          │  │  game_stats     │  │
          │  │  game_history   │  │
          │  └─────────────────┘  │
          └───────────────────────┘
```

---

## 📁 CẤU TRÚC PROJECT

```
caro-game-platform/
├── server/                      # Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # DB connection
│   │   ├── database/
│   │   │   ├── schema.sql      # DB schema
│   │   │   └── setup.js        # Setup script
│   │   ├── game/
│   │   │   ├── GameLogic.js    # Core game logic (10x10, win check)
│   │   │   ├── GameManager.js  # Room & player management
│   │   │   └── BotAI.js        # Intelligent bot
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/
│   │   │   └── auth.js         # Auth endpoints
│   │   ├── socket/
│   │   │   └── socketHandlers.js  # Socket.IO events
│   │   └── index.js            # Main server file
│   ├── package.json
│   └── .env.example
│
├── client/                      # Frontend (React)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js          # REST API calls
│   │   │   └── socket.js       # Socket.IO service
│   │   ├── views/
│   │   │   ├── HomeView.js     # Main menu
│   │   │   ├── GameView.js     # Game board (10x10)
│   │   │   ├── LoginView.js    # Login form
│   │   │   ├── RegisterView.js # Register form
│   │   │   └── ProfileView.js  # User profile & stats
│   │   ├── App.js              # Main app with routing
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── package.json                 # Root workspace
├── README_NEW.md               # This file
├── DEPLOYMENT.md               # Deployment guide
└── .gitignore
```

---

## 🚀 CÀI ĐẶT & CHẠY LOCAL

### Yêu cầu hệ thống

- Node.js ≥ 18.x
- PostgreSQL ≥ 13.x
- npm hoặc yarn

### Bước 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd caro-game-platform

# Install dependencies (root + server + client)
npm run install:all
```

### Bước 2: Setup Database

```bash
# Tạo database PostgreSQL
createdb caro_game

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE caro_game;
\q

# Chạy schema
cd server
npm run db:setup
```

### Bước 3: Environment Variables

Tạo file `server/.env`:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=caro_game
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
```

### Bước 4: Chạy Development Server

```bash
# Từ thư mục root, chạy cả server và client
npm run dev

# Hoặc chạy riêng:
npm run dev:server    # Server: http://localhost:3001
npm run dev:client    # Client: http://localhost:3000
```

### Bước 5: Mở Game

1. Truy cập: **http://localhost:3000**
2. Đăng ký tài khoản hoặc chơi ngay (guest)
3. Chọn chế độ chơi:
   - **2 Players**: Mở 2 tabs để test matchmaking
   - **3 Players**: Mở 3 tabs
   - **vs Bot**: Chơi solo ngay

---

## 🎮 HƯỚNG DẪN SỬ DỤNG

### Đăng ký / Đăng nhập

1. Click "Register" trên trang chủ
2. Nhập username, email, password (min 6 ký tự)
3. Sau khi đăng ký thành công, tự động đăng nhập

### Chơi Game

#### Chế độ 2 Players:

1. Click "2 Players" trên Home
2. Chờ server matchmaking (tìm 1 người khác)
3. Game bắt đầu, bạn là X hoặc O
4. Click vào ô trống để đánh
5. Thắng khi có 5 ô liên tiếp

#### Chế độ 3 Players:

- Tương tự 2 Players nhưng cần 3 người
- Thứ tự: X → O → V → X
- Cẩn thận với 2 đối thủ!

#### Chế độ vs Bot:

- Instant play (không cần chờ)
- Bạn luôn là X (đi trước)
- Bot sẽ tự động đánh sau bạn

### Xem Profile

1. Đăng nhập
2. Click "Profile" ở header
3. Xem stats: Wins, Losses, Win Rate, Streak
4. Xem Leaderboard (Top 10)

---

## 🔄 DATA FLOW

### 1. Authentication Flow

```
Client                          Server                      Database
  │                               │                             │
  ├──► POST /api/auth/register   │                             │
  │                               ├─► Hash password (bcrypt)    │
  │                               ├─────────────────────────────►│
  │                               │    INSERT INTO users        │
  │                               │◄─────────────────────────────┤
  │                               ├─► Generate JWT              │
  │◄──── { token, user } ─────────┤                             │
  │                               │                             │
```

### 2. Game Flow (2 Players)

```
Client 1           Server (Socket.IO)         Client 2         Database
  │                       │                       │                │
  ├──► findGame(2player) │                       │                │
  │                       ├─► Add to queue       │                │
  │                       │                       │                │
  │                       │  ◄──── findGame ──────┤                │
  │                       ├─► Match! Create room  │                │
  │                       │                       │                │
  │◄──── gameStart ───────┤                       │                │
  │   (yourSymbol: X)     ├───── gameStart ──────►│                │
  │                       │   (yourSymbol: O)     │                │
  │                       │                       │                │
  ├──► makeMove(2,3) ────►│                       │                │
  │                       ├─► Validate            │                │
  │                       ├─► Check win           │                │
  │◄──── updateBoard ─────┼───── updateBoard ────►│                │
  │                       │                       │                │
  │                       ├─► Winner detected!    │                │
  │◄──── gameOver ────────┼───── gameOver ────────►│                │
  │                       │                       │                │
  │                       ├───────────────────────────────────────►│
  │                       │   UPDATE game_stats   │                │
  │                       │   INSERT game_history │                │
```

### 3. Bot AI Decision Tree

```
Bot receives board state
         │
         ▼
  ┌──────────────────┐
  │  Can Win Now?    │ ──Yes──► Make winning move
  └────────┬─────────┘
           │ No
           ▼
  ┌──────────────────┐
  │ Block Opponent?  │ ──Yes──► Block threat
  └────────┬─────────┘
           │ No
           ▼
  ┌──────────────────┐
  │ Create Threat?   │ ──Yes──► Build 4-in-a-row
  └────────┬─────────┘
           │ No
           ▼
  ┌──────────────────┐
  │ Strategic Move?  │ ──Yes──► Move near center/pieces
  └────────┬─────────┘
           │ No
           ▼
  ┌──────────────────┐
  │  Random Move     │ ────────► Any valid cell
  └──────────────────┘
```

---

## 🧪 TESTING

### Test Authentication

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Profile (với token)
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Game Logic

```javascript
// server/src/game/__tests__/GameLogic.test.js
const GameLogic = require("../GameLogic");

// Test winner detection
const board = GameLogic.createEmptyBoard();
board[0][0] = "X";
board[0][1] = "X";
board[0][2] = "X";
board[0][3] = "X";
board[0][4] = "X";

const hasWon = GameLogic.checkWinner(board, 0, 4, "X");
console.assert(hasWon === true, "Should detect horizontal win");
```

---

## 📊 DATABASE SCHEMA

### Tables

#### `users`

```sql
id           SERIAL PRIMARY KEY
username     VARCHAR(50) UNIQUE
email        VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
avatar_url   VARCHAR(500)
created_at   TIMESTAMP
```

#### `game_stats`

```sql
id            SERIAL PRIMARY KEY
user_id       INTEGER (FK → users.id)
wins          INTEGER DEFAULT 0
losses        INTEGER DEFAULT 0
draws         INTEGER DEFAULT 0
games_played  INTEGER DEFAULT 0
highest_streak INTEGER DEFAULT 0
rating        INTEGER DEFAULT 1000
```

#### `game_history`

```sql
id          SERIAL PRIMARY KEY
game_mode   VARCHAR(20)  # '2player', '3player', 'vs_bot'
player1_id  INTEGER (FK → users.id)
player2_id  INTEGER (FK → users.id)
player3_id  INTEGER (FK → users.id)
winner_id   INTEGER (FK → users.id)
result      VARCHAR(20)  # 'win', 'draw'
board_state TEXT         # JSON
moves_count INTEGER
duration    INTEGER      # seconds
played_at   TIMESTAMP
```

---

## 🚀 DEPLOYMENT

Xem file **[DEPLOYMENT.md](./DEPLOYMENT.md)** để biết hướng dẫn chi tiết deploy lên:

- ✅ Render (free tier)
- ✅ Vercel + Supabase
- ✅ Heroku
- ✅ VPS (DigitalOcean/AWS/Linode)

---

## 🐛 TROUBLESHOOTING

### Socket.IO không kết nối

**Triệu chứng**: "Client connected" không xuất hiện trong server logs

**Giải pháp**:

1. Kiểm tra `CLIENT_URL` trong `.env`
2. Kiểm tra CORS settings
3. Thử dùng `transports: ['polling']` trước

### Database connection failed

**Triệu chứng**: "Connection refused" hoặc "password authentication failed"

**Giải pháp**:

1. Kiểm tra PostgreSQL đã chạy: `sudo service postgresql status`
2. Kiểm tra credentials trong `.env`
3. Thử connect trực tiếp: `psql -U postgres -d caro_game`

### React build failed

**Triệu chứng**: "Module not found" khi build

**Giải pháp**:

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎓 KIẾN THỨC ĐÃ ÁP DỤNG

### Backend:

- ✅ RESTful API design
- ✅ WebSocket (Socket.IO) real-time communication
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ PostgreSQL + SQL queries
- ✅ Game logic algorithms
- ✅ AI bot (decision tree)

### Frontend:

- ✅ React Hooks (useState, useEffect)
- ✅ React Router (SPA routing)
- ✅ Socket.IO client
- ✅ Async/await + Promises
- ✅ CSS animations
- ✅ Responsive design

### System Design:

- ✅ Client-Server architecture
- ✅ Stateful vs Stateless
- ✅ Real-time sync
- ✅ Matchmaking algorithm
- ✅ Room-based multiplayer

---

## 📈 FUTURE ENHANCEMENTS

Các tính năng có thể thêm:

1. **Chat System**: Thêm chat giữa players
2. **Spectator Mode**: Xem người khác chơi
3. **Tournament Mode**: Tổ chức giải đấu
4. **Replay System**: Xem lại ván đấu
5. **Multiple Board Sizes**: 15x15, 20x20
6. **Custom Themes**: Light/Dark modes
7. **Friends System**: Kết bạn và mời chơi
8. **Achievements**: Huy hiệu, thành tích
9. **Mobile App**: React Native version
10. **Advanced AI**: Minimax algorithm

---

## 🤝 CONTRIBUTING

Contributions are welcome! Nếu muốn đóng góp:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 LICENSE

MIT License - Feel free to use for learning or commercial purposes.

---

## 🙏 ACKNOWLEDGMENTS

- Socket.IO team for amazing real-time library
- React team for the best UI framework
- PostgreSQL community
- All open-source contributors

---

## 📞 SUPPORT

Nếu có vấn đề hoặc câu hỏi:

- 📧 Email: your-email@example.com
- 💬 GitHub Issues
- 🐛 Bug reports welcome!

---

**Made with ❤️ by [Your Name]**

**Happy Gaming! 🎮✨**
