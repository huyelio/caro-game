# 🎮 GAME CỜ CARO ONLINE 5×5

Game cờ caro (tic-tac-toe) online cho 2 người chơi, sử dụng kiến trúc **Client-Server** với **Socket.IO** để giao tiếp real-time.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Socket.IO](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

---

## 📋 MỤC LỤC

1. [Kiến trúc Client-Server](#-kiến-trúc-client-server)
2. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
3. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
4. [Cài đặt & Chạy](#-cài-đặt--chạy)
5. [Luồng dữ liệu (Data Flow)](#-luồng-dữ-liệu-data-flow)
6. [Giải thích chi tiết Server](#-giải-thích-chi-tiết-server)
7. [Giải thích chi tiết Client](#-giải-thích-chi-tiết-client)
8. [Socket.IO Events](#-socketio-events)
9. [Logic game](#-logic-game)

---

## 🏗 KIẾN TRÚC CLIENT-SERVER

### Mô hình hoạt động

```
┌─────────────┐                    ┌─────────────┐
│   CLIENT 1  │◄──── Socket.IO ────►│             │
│  (Browser)  │                    │   SERVER    │
└─────────────┘                    │  (Node.js)  │
                                   │             │
┌─────────────┐                    │             │
│   CLIENT 2  │◄──── Socket.IO ────►│             │
│  (Browser)  │                    └─────────────┘
└─────────────┘
```

### Vai trò từng thành phần

#### 🖥 **SERVER (Node.js + Express + Socket.IO)**

- **Matchmaking**: Tự động ghép cặp 2 người chơi vào 1 room
- **Game State Management**: Quản lý trạng thái game, bàn cờ, lượt chơi
- **Validation**: Kiểm tra tính hợp lệ của mỗi nước đi
- **Game Logic**: Xác định thắng/thua/hòa
- **Broadcasting**: Gửi cập nhật đến tất cả clients trong room

#### 💻 **CLIENT (HTML + CSS + JavaScript)**

- **UI/UX**: Hiển thị bàn cờ, trạng thái game
- **User Interaction**: Xử lý click, input từ người chơi
- **Socket Connection**: Kết nối và giao tiếp với server
- **Event Handling**: Lắng nghe và xử lý events từ server
- **State Sync**: Đồng bộ trạng thái game với server

---

## 🛠 CÔNG NGHỆ SỬ DỤNG

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication

### Frontend

- **HTML5**: Cấu trúc trang
- **CSS3**: Styling với animations, gradients, responsive
- **Vanilla JavaScript**: Logic client (không dùng framework)

### Đặc điểm kỹ thuật

- ✅ Real-time communication
- ✅ Automatic matchmaking
- ✅ Server-side validation
- ✅ Responsive design
- ✅ Modern UI/UX

---

## 📁 CẤU TRÚC THƯ MỤC

```
btl/
├── server/
│   └── server.js          # Server code chính (Node.js + Socket.IO)
│
├── public/                # Client files (served statically)
│   ├── index.html        # Giao diện chính
│   ├── styles.css        # Styling với animations
│   └── game.js           # Logic client (Socket.IO client)
│
├── package.json          # Dependencies
└── README.md            # Hướng dẫn này
```

---

## 🚀 CÀI ĐẶT & CHẠY

### Bước 1: Cài đặt dependencies

```bash
npm install
```

Hoặc nếu chưa có `package.json`:

```bash
npm init -y
npm install express socket.io
npm install --save-dev nodemon
```

### Bước 2: Chạy server

**Chế độ production:**

```bash
npm start
```

**Chế độ development (auto-restart):**

```bash
npm run dev
```

### Bước 3: Mở game trong browser

1. Mở trình duyệt và truy cập: **http://localhost:3000**
2. Mở thêm 1 tab hoặc cửa sổ mới (hoặc dùng 2 máy khác nhau)
3. Cả 2 người chơi đều nhấn **"Tìm trận đấu"**
4. Server sẽ tự động ghép cặp 2 người vào 1 room
5. Bắt đầu chơi! ✨

### Port mặc định

- Server: `3000`
- Có thể thay đổi bằng biến môi trường: `PORT=4000 npm start`

---

## 🔄 LUỒNG DỮ LIỆU (DATA FLOW)

### 1. **Kết nối ban đầu**

```
Client                          Server
  │                               │
  ├──── connect ─────────────────►│
  │                               ├── Tạo socket connection
  │◄──── 'connect' event ─────────┤
  │                               │
```

### 2. **Matchmaking**

```
Client 1                        Server                      Client 2
  │                               │                             │
  ├──── findMatch ───────────────►│                             │
  │                               ├── Add to waiting queue      │
  │◄──── waiting ─────────────────┤                             │
  │                               │                             │
  │                               │◄──── findMatch ─────────────┤
  │                               ├── Match found!              │
  │                               ├── Create room               │
  │                               ├── Join both players         │
  │                               │                             │
  │◄──── gameStart ───────────────┤                             │
  │     (yourSymbol: 'X')         │                             │
  │                               ├──── gameStart ─────────────►│
  │                               │     (yourSymbol: 'O')       │
```

### 3. **Gameplay Loop**

```
Client (X)                      Server                      Client (O)
  │                               │                             │
  ├──── makeMove(row, col) ──────►│                             │
  │                               ├── Validate move             │
  │                               ├── Check valid position      │
  │                               ├── Check correct turn        │
  │                               ├── Update board[row][col]    │
  │                               ├── Check winner             │
  │                               │   ├── checkWinner()         │
  │                               │   └── isBoardFull()         │
  │                               │                             │
  │◄──── updateBoard ─────────────┼──── updateBoard ───────────►│
  │     (board, currentTurn)      │     (board, currentTurn)    │
  │                               │                             │
```

### 4. **Game Over**

```
Client 1                        Server                      Client 2
  │                               │                             │
  │                               ├── Winner detected!          │
  │◄──── gameOver ────────────────┼──── gameOver ──────────────►│
  │     (winner: 'X')             │     (winner: 'X')           │
  │                               │                             │
  │                               ├── Delete room (after 5s)    │
  │                               │                             │
```

### 5. **Disconnect Handling**

```
Client 1                        Server                      Client 2
  │                               │                             │
  │  ╳ disconnect                 │                             │
  │                               ├── Remove from room          │
  │                               ├──── opponentLeft ──────────►│
  │                               ├── Delete room               │
  │                               │                             │
```

---

## 🔧 GIẢI THÍCH CHI TIẾT SERVER

### File: `server/server.js`

#### **1. Setup Server**

```javascript
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
```

- **Express**: Web server framework
- **http.createServer**: Tạo HTTP server
- **socketIO(server)**: Gắn Socket.IO vào HTTP server

#### **2. Data Structures**

```javascript
const waitingPlayers = []; // Queue người chơi đang chờ
const rooms = new Map(); // Map<roomId, GameRoom>
```

**GameRoom structure:**

```javascript
{
  id: 'room_1234567890',
  players: [
    { socketId: 'abc', symbol: 'X', playerNum: 1 },
    { socketId: 'xyz', symbol: 'O', playerNum: 2 }
  ],
  board: [[null, null, ...], ...],  // 5x5 array
  currentTurn: 'X',
  gameOver: false,
  winner: null
}
```

#### **3. Core Functions**

##### **createEmptyBoard()**

Tạo bàn cờ trống 5×5.

```javascript
function createEmptyBoard() {
  return Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));
}
```

##### **checkWinner(board, row, col, symbol)**

Kiểm tra thắng thua bằng cách đếm 5 ô liên tiếp theo 4 hướng:

- Ngang (→)
- Dọc (↓)
- Chéo chính (\)
- Chéo phụ (/)

```javascript
function checkWinner(board, row, col, symbol) {
  const directions = [
    { dr: 0, dc: 1 }, // Ngang
    { dr: 1, dc: 0 }, // Dọc
    { dr: 1, dc: 1 }, // Chéo chính
    { dr: 1, dc: -1 }, // Chéo phụ
  ];

  for (let { dr, dc } of directions) {
    let count = 1;
    // Đếm về 2 phía từ ô vừa đánh
    // ... (xem code để biết chi tiết)
    if (count >= 5) return true;
  }
  return false;
}
```

##### **isValidMove(room, row, col, socketId)**

Validate nước đi:

- ✅ Game chưa kết thúc
- ✅ Đúng lượt người chơi
- ✅ Vị trí hợp lệ (0-4)
- ✅ Ô chưa được đánh

##### **createRoom(player1, player2)**

Tạo room mới cho 2 người chơi:

- Tạo roomId unique
- Khởi tạo bàn cờ trống
- Assign symbols (X và O)
- Join cả 2 vào Socket.IO room

#### **4. Socket Events**

##### **Event: 'findMatch'**

```javascript
socket.on('findMatch', () => {
  waitingPlayers.push(socket.id);

  if (waitingPlayers.length >= 2) {
    const p1 = waitingPlayers.shift();
    const p2 = waitingPlayers.shift();
    const room = createRoom(p1, p2);

    // Emit gameStart cho cả 2
    io.to(p1).emit('gameStart', {...});
    io.to(p2).emit('gameStart', {...});
  } else {
    socket.emit('waiting', {...});
  }
});
```

##### **Event: 'makeMove'**

```javascript
socket.on('makeMove', ({ row, col }) => {
  const room = findRoomBySocketId(socket.id);

  // 1. Validate
  const validation = isValidMove(room, row, col, socket.id);
  if (!validation.valid) {
    socket.emit('error', {...});
    return;
  }

  // 2. Update board
  room.board[row][col] = player.symbol;

  // 3. Check win
  if (checkWinner(room.board, row, col, player.symbol)) {
    room.gameOver = true;
    io.to(room.id).emit('gameOver', {winner: player.symbol});
    return;
  }

  // 4. Check draw
  if (isBoardFull(room.board)) {
    io.to(room.id).emit('gameOver', {winner: 'draw'});
    return;
  }

  // 5. Switch turn & broadcast
  room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
  io.to(room.id).emit('updateBoard', {...});
});
```

##### **Event: 'disconnect'**

```javascript
socket.on('disconnect', () => {
  // Remove from waiting queue
  const index = waitingPlayers.indexOf(socket.id);
  if (index !== -1) waitingPlayers.splice(index, 1);

  // Notify opponent and delete room
  const room = findRoomBySocketId(socket.id);
  if (room) {
    const opponent = room.players.find(p => p.socketId !== socket.id);
    io.to(opponent.socketId).emit('opponentLeft', {...});
    deleteRoom(room.id);
  }
});
```

---

## 💻 GIẢI THÍCH CHI TIẾT CLIENT

### File: `public/game.js`

#### **1. Game State**

```javascript
let gameState = {
  roomId: null,
  mySymbol: null, // 'X' hoặc 'O'
  opponentSymbol: null,
  currentTurn: null,
  board: [], // 5x5 array
  gameActive: false,
  connected: false,
};
```

#### **2. Socket Initialization**

```javascript
function initSocket() {
  socket = io(); // Kết nối tới server

  // Đăng ký các event handlers
  socket.on("connect", handleConnect);
  socket.on("gameStart", handleGameStart);
  socket.on("updateBoard", handleUpdateBoard);
  socket.on("gameOver", handleGameOver);
  // ...
}
```

#### **3. Core Functions**

##### **createBoard()**

Tạo 25 ô (5×5) bằng DOM:

```javascript
function createBoard() {
  elements.board.innerHTML = "";

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", () => handleCellClick(row, col));
      elements.board.appendChild(cell);
    }
  }
}
```

##### **renderBoard()**

Cập nhật hiển thị dựa trên `gameState.board`:

```javascript
function renderBoard() {
  const cells = elements.board.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const value = gameState.board[row][col];

    if (value === "X") {
      cell.innerHTML = "<span>❌</span>";
      cell.classList.add("filled");
    } else if (value === "O") {
      cell.innerHTML = "<span>⭕</span>";
      cell.classList.add("filled");
    }

    // Disable nếu không phải lượt mình
    if (gameState.currentTurn !== gameState.mySymbol) {
      cell.classList.add("disabled");
    }
  });
}
```

##### **handleCellClick(row, col)**

Xử lý khi user click vào ô:

```javascript
function handleCellClick(row, col) {
  // Validation phía client
  if (!gameState.gameActive) {
    showMessage("Trận đấu chưa bắt đầu!", "error");
    return;
  }

  if (gameState.currentTurn !== gameState.mySymbol) {
    showMessage("Chưa đến lượt của bạn!", "error");
    return;
  }

  if (gameState.board[row][col] !== null) {
    showMessage("Ô này đã có người đánh!", "error");
    return;
  }

  // Gửi lên server
  socket.emit("makeMove", { row, col });
}
```

#### **4. Event Handlers**

##### **gameStart Event**

```javascript
socket.on("gameStart", (data) => {
  gameState.mySymbol = data.yourSymbol;
  gameState.board = data.board;
  gameState.currentTurn = data.currentTurn;
  gameState.gameActive = true;

  renderBoard();
  updateUI();
});
```

##### **updateBoard Event**

```javascript
socket.on("updateBoard", (data) => {
  gameState.board = data.board;
  gameState.currentTurn = data.currentTurn;

  renderBoard();
  updateTurnIndicator();
});
```

##### **gameOver Event**

```javascript
socket.on("gameOver", (data) => {
  gameState.gameActive = false;
  showGameOverModal(data);
});
```

---

## 📡 SOCKET.IO EVENTS

### Client → Server

| Event       | Payload      | Mô tả                |
| ----------- | ------------ | -------------------- |
| `findMatch` | -            | Yêu cầu tìm trận đấu |
| `makeMove`  | `{row, col}` | Gửi nước đi          |
| `rematch`   | -            | Chơi lại             |

### Server → Client

| Event          | Payload                                             | Mô tả              |
| -------------- | --------------------------------------------------- | ------------------ |
| `connect`      | -                                                   | Kết nối thành công |
| `waiting`      | `{message}`                                         | Đang chờ đối thủ   |
| `gameStart`    | `{roomId, yourSymbol, board, currentTurn, message}` | Bắt đầu game       |
| `updateBoard`  | `{board, row, col, symbol, currentTurn}`            | Cập nhật bàn cờ    |
| `gameOver`     | `{winner, message}`                                 | Kết thúc game      |
| `opponentLeft` | `{message}`                                         | Đối thủ rời đi     |
| `error`        | `{message}`                                         | Lỗi                |

---

## 🎲 LOGIC GAME

### Luật chơi Cờ Caro

1. **Bàn cờ**: 5×5 (25 ô)
2. **Người chơi**: 2 người (X và O)
3. **Luật**: Người nào tạo được 5 ô liên tiếp theo hàng ngang, dọc, hoặc chéo sẽ thắng
4. **Hòa**: Bàn cờ đầy mà không ai thắng

### Thuật toán kiểm tra thắng

**Pseudo-code:**

```
function checkWinner(board, lastRow, lastCol, symbol):
  directions = [horizontal, vertical, diagonal1, diagonal2]

  for each direction:
    count = 1  // Ô vừa đánh

    // Đếm về phía trước
    count += countInDirection(board, lastRow, lastCol, direction, symbol)

    // Đếm về phía sau
    count += countInDirection(board, lastRow, lastCol, -direction, symbol)

    if count >= 5:
      return true

  return false
```

**Ví dụ:**

```
Bàn cờ:
  0 1 2 3 4
0 . . . . .
1 . X X X .
2 . . O . .
3 . O . . .
4 O . . . .

Kiểm tra thắng cho O tại (4, 0):
- Hướng chéo phụ (/): (4,0) → (3,1) → (2,2) ❌ (chỉ có 3)
- Hướng khác: Không đủ 5

→ Chưa thắng
```

---

## 🎨 GIAO DIỆN

### Đặc điểm UI/UX

- ✨ **Modern Design**: Gradient, shadows, animations
- 🎭 **Smooth Animations**: Fade-in, slide, pulse, bounce
- 📱 **Responsive**: Hoạt động tốt trên mobile và desktop
- 🌈 **Color Scheme**: Dark theme với accent colors
- 🔔 **Visual Feedback**: Hover effects, active states, notifications

### CSS Highlights

```css
/* Gradient Background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card Shadow */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);

/* Pulse Animation cho lượt hiện tại */
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
  }
}

/* Cell hover effect */
.cell:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}
```

---

## 🐛 XỬ LÝ LỖI & EDGE CASES

### Server-side Validation

✅ **Kiểm tra lượt chơi**: Chỉ người có lượt mới được đánh  
✅ **Kiểm tra vị trí**: Ô phải trong range 0-4  
✅ **Kiểm tra ô trống**: Không được đánh vào ô đã có người  
✅ **Kiểm tra game state**: Không được đánh khi game đã kết thúc

### Disconnect Handling

- Client disconnect → Server thông báo cho opponent → Delete room
- Server restart → Clients tự động reconnect (Socket.IO auto-reconnect)

### Race Conditions

- Server là single source of truth
- Mọi move đều được validate trên server
- Client chỉ hiển thị, không tự ý thay đổi game state

---

## 🚀 NÂNG CAO (OPTIONAL)

### Tính năng có thể thêm

1. **Room với nhiều hơn 2 người**: Spectator mode
2. **Chat**: Thêm chat giữa 2 người chơi
3. **Elo Rating**: Hệ thống xếp hạng
4. **Game History**: Lưu lại lịch sử các ván đấu
5. **Timer**: Giới hạn thời gian mỗi nước đi
6. **AI Mode**: Chơi với máy khi không có đối thủ
7. **Replay**: Xem lại ván đấu
8. **Themes**: Nhiều theme UI khác nhau

---

## 📝 GHI CHÚ KỸ THUẬT

### Tại sao Socket.IO?

- ✅ **Real-time**: WebSocket với HTTP long-polling fallback
- ✅ **Room support**: Dễ dàng quản lý rooms
- ✅ **Auto-reconnect**: Tự động kết nối lại khi mất mạng
- ✅ **Broadcasting**: Gửi message cho nhiều clients
- ✅ **Cross-browser**: Hoạt động trên mọi browser

### Tại sao validation trên Server?

- 🔒 **Security**: Client có thể bị hack/cheat
- ✅ **Single source of truth**: Server là trọng tài cuối cùng
- 🎯 **Consistency**: Đảm bảo game logic nhất quán

---

## 📚 TÀI LIỆU THAM KHẢO

- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [MDN Web Docs - WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 👨‍💻 TROUBLESHOOTING

### Lỗi thường gặp

**1. "Cannot GET /"**

- ✅ Kiểm tra `app.use(express.static(...))` đã đúng path chưa
- ✅ Đảm bảo file `index.html` nằm trong thư mục `public/`

**2. "Socket.IO connection error"**

- ✅ Kiểm tra server đã chạy chưa
- ✅ Kiểm tra port có bị conflict không
- ✅ Xem console log để debug

**3. "Board không update"**

- ✅ Mở DevTools → Network → WS để xem Socket.IO messages
- ✅ Kiểm tra `gameState.board` có được update không
- ✅ Verify event handlers đã được đăng ký

**4. "Không tìm được đối thủ"**

- ✅ Mở 2 tab/cửa sổ khác nhau
- ✅ Hoặc mở từ 2 máy khác nhau trong cùng mạng

---

## 🎉 KẾT LUẬN

Project này minh họa đầy đủ:

- ✅ Kiến trúc **Client-Server**
- ✅ Real-time communication với **Socket.IO**
- ✅ **Matchmaking** system
- ✅ **Game logic** và validation
- ✅ Modern **UI/UX** design

**Chúc bạn code vui vẻ! 🚀**

---

## 📧 LIÊN HỆ

Nếu có câu hỏi hoặc góp ý, hãy tạo issue trong repository này.

**Happy Coding! 🎮✨**
