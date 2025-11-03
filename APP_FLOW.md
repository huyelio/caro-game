# 📊 LUỒNG HOẠT ĐỘNG CHI TIẾT - GAME CỜ CARO

## 📑 Mục Lục

1. [Đăng Ký Tài Khoản](#1-đăng-ký-tài-khoản)
2. [Đăng Nhập](#2-đăng-nhập)
3. [Trang Chủ & Chọn Chế Độ](#3-trang-chủ--chọn-chế-độ)
4. [Tìm Trận Đấu](#4-tìm-trận-đấu)
5. [Trong Game](#5-trong-game)
6. [Kết Thúc Game](#6-kết-thúc-game)

---

## 1. Đăng Ký Tài Khoản

### 🎯 Flow: User → Client → Server → Database

```
[User nhấn "Đăng ký"]
    ↓
[RegisterView.js]
    → handleSubmit() được gọi
    ↓
[api.js]
    → register(username, email, password)
    → axios.post('/api/auth/register', { username, email, password })
    ↓
[SERVER: routes/auth.js]
    → POST /api/auth/register
    → Validation: express-validator kiểm tra input
        • username: 3-50 ký tự
        • email: format hợp lệ
        • password: tối thiểu 6 ký tự
    ↓
    → Check user tồn tại:
        SELECT id FROM users WHERE username = $1 OR email = $2
    ↓
    → Hash password:
        bcrypt.hash(password, 10)
    ↓
    → Tạo user mới:
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
    ↓
    → Tạo game stats ban đầu:
        INSERT INTO game_stats (user_id) VALUES ($1)
    ↓
    → Tạo JWT token:
        jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' })
    ↓
    → Response:
        { token, user: { id, username, email } }
    ↓
[Client: RegisterView.js]
    → onLogin(user, token) được gọi
    → Lưu vào localStorage:
        • localStorage.setItem('token', token)
        • localStorage.setItem('user', JSON.stringify(user))
    ↓
    → navigate('/') - Chuyển về trang chủ
```

### 📂 Files Liên Quan

- **Client**: `client/src/views/RegisterView.js`
- **API Service**: `client/src/services/api.js`
- **Server Route**: `server/src/routes/auth.js`
- **Database**: `users` table, `game_stats` table

---

## 2. Đăng Nhập

### 🎯 Flow: User → Client → Server → Database

```
[User nhấn "Đăng nhập"]
    ↓
[LoginView.js]
    → handleSubmit() được gọi
    ↓
[api.js]
    → login(email, password)
    → axios.post('/api/auth/login', { email, password })
    ↓
[SERVER: routes/auth.js]
    → POST /api/auth/login
    → Validation: email format, password required
    ↓
    → Tìm user:
        SELECT id, username, email, password_hash
        FROM users WHERE email = $1
    ↓
    → Verify password:
        bcrypt.compare(password, password_hash)
    ↓
    → Cập nhật last_login:
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1
    ↓
    → Tạo JWT token:
        jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' })
    ↓
    → Response:
        { token, user: { id, username, email } }
    ↓
[Client: LoginView.js]
    → onLogin(user, token) được gọi
    → Lưu localStorage
    → navigate('/') - Chuyển về trang chủ
```

### 📂 Files Liên Quan

- **Client**: `client/src/views/LoginView.js`
- **API Service**: `client/src/services/api.js`
- **Server Route**: `server/src/routes/auth.js`

---

## 3. Trang Chủ & Chọn Chế Độ

### 🎯 Flow: Hiển thị trang chủ và chọn game mode

```
[HomeView.js render]
    ↓
    → Hiển thị thông tin user (nếu đã login)
    → Hiển thị 3 game modes:
        • 2 người chơi
        • 3 người chơi
        • Chơi với máy
    ↓
[User click vào 1 mode card]
    ↓
    → handleGameModeSelect(mode) được gọi
    → mode = "2player" | "3player" | "vs_bot"
    ↓
    → navigate(`/game?mode=${mode}`)
    ↓
[Browser chuyển sang GameView]
```

### 📂 Files Liên Quan

- **Client**: `client/src/views/HomeView.js`

---

## 4. Tìm Trận Đấu

### 🎯 Flow: Kết nối Socket.IO và matchmaking

```
[GameView.js - useEffect chạy khi component mount]
    ↓
    → Đọc mode từ URL params: useSearchParams()
    ↓
[socket.js]
    → socketService.connect(user?.id)
    → Tạo Socket.IO connection:
        io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true
        })
    ↓
    → socket.emit('authenticate', { userId })
    ↓
[SERVER: socketHandlers.js]
    → Event 'connection' fired
    → socket.id được tạo
    → Log: "✅ Client connected: {socket.id}"
    ↓
    → Event 'authenticate' received
    → Lưu socket.userId = data.userId
    ↓
[Client: GameView.js]
    → Đăng ký các event listeners:
        • socket.on('waiting', handleWaiting)
        • socket.on('gameStart', handleGameStart)
        • socket.on('updateBoard', handleUpdateBoard)
        • socket.on('gameOver', handleGameOver)
        • socket.on('playerLeft', handlePlayerLeft)
        • socket.on('error', handleError)
    ↓
[socket.js]
    → socketService.findGame(mode)
    → socket.emit('findGame', { mode })
    ↓
[SERVER: socketHandlers.js]
    → Event 'findGame' received
    → const { mode } = data
    ↓
    ┌─────────────────────────────────────────┐
    │  NHÁNH 1: mode === "vs_bot"            │
    └─────────────────────────────────────────┘
        ↓
        [GameManager.js]
        → gameManager.createRoom([player, botPlayer], "vs_bot")
        → Tạo room object:
            {
              id: "room_timestamp_random",
              mode: "vs_bot",
              players: [
                { socketId, userId, symbol: "X", playerNum: 1 },
                { socketId: "BOT", userId: null, symbol: "O", playerNum: 2 }
              ],
              board: 10x10 empty array,
              currentTurn: "X",
              gameOver: false,
              startedAt: Date.now(),
              moveCount: 0
            }
        ↓
        → socket.join(room.id)
        → socket.emit('gameStart', {...})
        → Log: "Bot game created: {room.id}"
        ↓
        [Client: GameView.js]
        → handleGameStart(data) được gọi
        → setGameState({
            board: data.board,
            mySymbol: "X",
            currentTurn: "X",
            gameActive: true,
            waiting: false,
            message: "Game started!"
          })
        → Game bắt đầu ngay!

    ┌─────────────────────────────────────────┐
    │  NHÁNH 2: mode === "2player"           │
    └─────────────────────────────────────────┘
        ↓
        [GameManager.js]
        → gameManager.removeFromQueues(socket.id)
        → gameManager.addToQueue(socket.id, "2player", userId)
        → Thêm vào waitingPlayers2 array
        ↓
        → gameManager.tryCreate2PlayerMatch()
        ↓
        ⚠️ TH1: Chưa đủ người (waitingPlayers2.length < 2)
            ↓
            → room = null
            → socket.emit('waiting', {
                message: "Waiting for 1 more player(s)...",
                queueSize
              })
            ↓
            [Client: GameView.js]
            → handleWaiting(data) được gọi
            → setGameState({ waiting: true, message: "Đang tìm đối thủ..." })
            → Hiển thị spinner + message

        ✅ TH2: Đủ 2 người (waitingPlayers2.length >= 2)
            ↓
            → Lấy 2 player từ queue:
                player1 = waitingPlayers2.shift()
                player2 = waitingPlayers2.shift()
            ↓
            → createRoom([player1, player2], "2player")
            → Tạo room với symbols: ["X", "O"]
            ↓
            → Thêm cả 2 players vào Socket.IO room:
                player1Socket.join(room.id)
                player2Socket.join(room.id)
            ↓
            → Emit 'gameStart' cho từng player:
                player1Socket.emit('gameStart', {
                  roomId, mode, yourSymbol: "X",
                  currentTurn: "X", board, message
                })
                player2Socket.emit('gameStart', {
                  roomId, mode, yourSymbol: "O",
                  currentTurn: "X", board, message
                })
            ↓
            [Client: GameView.js - CẢ 2 PLAYERS]
            → handleGameStart(data) được gọi
            → Game bắt đầu!

    ┌─────────────────────────────────────────┐
    │  NHÁNH 3: mode === "3player"           │
    └─────────────────────────────────────────┘
        → Tương tự 2player nhưng cần 3 người
        → Symbols: ["X", "O", "V"]
```

### 📂 Files Liên Quan

- **Client**:
  - `client/src/views/GameView.js`
  - `client/src/services/socket.js`
- **Server**:
  - `server/src/socket/socketHandlers.js`
  - `server/src/game/GameManager.js`
  - `server/src/game/GameLogic.js`

---

## 5. Trong Game

### 🎯 Flow: User đánh cờ

```
[User click vào 1 ô trên bàn cờ]
    ↓
[GameView.js]
    → handleCellClick(row, col) được gọi
    ↓
    → Kiểm tra điều kiện:
        if (!gameState.gameActive) return;           // Game chưa bắt đầu/đã kết thúc
        if (currentTurn !== mySymbol) return;         // Không phải lượt mình
        if (board[row][col] !== null) return;        // Ô đã có người đánh
    ↓
[socket.js]
    → socketService.makeMove(row, col)
    → socket.emit('makeMove', { row, col })
    ↓
[SERVER: socketHandlers.js]
    → Event 'makeMove' received
    → const { row, col } = data
    ↓
    → Tìm room của player:
        gameManager.getRoomByPlayer(socket.id)
    ↓
    → Kiểm tra room tồn tại
    ↓
[GameManager.js]
    → gameManager.makeMove(roomId, socketId, row, col)
    ↓
    → Kiểm tra:
        • Room tồn tại?
        • Game chưa kết thúc?
        • Player trong room?
        • Đúng lượt?
    ↓
[GameLogic.js]
    → GameLogic.isValidMove(board, row, col)
    → Kiểm tra:
        • row, col trong phạm vi [0-9]?
        • Ô còn trống (null)?
    ↓
    ✅ Move hợp lệ
    ↓
[GameManager.js]
    → Cập nhật board:
        room.board[row][col] = player.symbol
        room.moveCount++
    ↓
[GameLogic.js]
    → GameLogic.checkWinner(board, row, col, symbol)
    → Kiểm tra 4 hướng:
        • Ngang (→)
        • Dọc (↓)
        • Chéo xuống (\)
        • Chéo lên (/)
    → Đếm số quân liên tiếp theo mỗi hướng
    → Nếu count >= 5 → return true (Thắng!)
    ↓
    ⚠️ TH1: Chưa thắng
        ↓
        → GameLogic.isBoardFull(board)
        → Kiểm tra tất cả ô đã được điền?
        ↓
            ⚠️ TH1.1: Board chưa đầy
                ↓
                → Chuyển lượt:
                    room.currentTurn = GameLogic.getNextTurn(currentTurn, playerCount)
                    • 2 players: X → O → X
                    • 3 players: X → O → V → X
                ↓
                → Return:
                    {
                      success: true,
                      gameOver: false,
                      board: room.board,
                      currentTurn: room.currentTurn
                    }
                ↓
                [SERVER: socketHandlers.js]
                → io.to(room.id).emit('updateBoard', {
                    board, row, col, currentTurn
                  })
                ↓
                [Client: GameView.js - TẤT CẢ PLAYERS]
                → handleUpdateBoard(data) được gọi
                → setGameState({
                    board: data.board,
                    currentTurn: data.currentTurn
                  })
                → Bàn cờ cập nhật, chuyển lượt!
                ↓
                ┌──────────────────────────────────┐
                │  NẾU mode === "vs_bot"          │
                │  VÀ currentTurn === "O" (Bot)   │
                └──────────────────────────────────┘
                    ↓
                    → setTimeout(500ms) - Bot "suy nghĩ"
                    ↓
                    [BotAI.js]
                    → BotAI.findBestMove(board, "O", ["X", "O"])
                    → AI logic:
                        1. Kiểm tra nước thắng ngay (4 quân liên tiếp)
                        2. Chặn đối thủ (đối thủ có 4 quân)
                        3. Tạo cơ hội (3 quân liên tiếp)
                        4. Chặn cơ hội đối thủ
                        5. Đánh random gần quân đã có
                    ↓
                    → Return: { row, col }
                    ↓
                    → gameManager.makeMove(roomId, "BOT", row, col)
                    → (Lặp lại logic check thắng/thua)
                    ↓
                    → io.to(room.id).emit('updateBoard', {...})

            ⚠️ TH1.2: Board đầy (Hòa)
                ↓
                → room.gameOver = true
                → room.winner = "draw"
                → room.endedAt = Date.now()
                ↓
                → Return:
                    {
                      success: true,
                      gameOver: true,
                      winner: "draw",
                      board: room.board
                    }
                → Chuyển sang phần "Kết Thúc Game"

    ✅ TH2: Thắng (count >= 5)
        ↓
        → room.gameOver = true
        → room.winner = player.symbol
        → room.winnerId = player.userId
        → room.endedAt = Date.now()
        ↓
        → Return:
            {
              success: true,
              gameOver: true,
              winner: player.symbol,
              board: room.board
            }
        → Chuyển sang phần "Kết Thúc Game"
```

### 📂 Files Liên Quan

- **Client**:
  - `client/src/views/GameView.js`
  - `client/src/services/socket.js`
- **Server**:
  - `server/src/socket/socketHandlers.js`
  - `server/src/game/GameManager.js`
  - `server/src/game/GameLogic.js`
  - `server/src/game/BotAI.js`

---

## 6. Kết Thúc Game

### 🎯 Flow: Game Over → Cập nhật stats → Cleanup

```
[Từ phần 5 - Khi có người thắng hoặc hòa]
    ↓
[SERVER: socketHandlers.js]
    → result.gameOver === true
    ↓
    → io.to(room.id).emit('gameOver', {
        winner: result.winner,
        message: winner === "draw"
                  ? "Draw!"
                  : `${winner} wins! 🎉`
      })
    ↓
[Client: GameView.js - TẤT CẢ PLAYERS]
    → handleGameOver(data) được gọi
    → setGameState({
        gameActive: false,
        gameOver: true,
        winner: data.winner,
        message: data.message
      })
    → Hiển thị kết quả:
        • "Bạn đã thắng!" (nếu winner === mySymbol)
        • "Bạn đã thua" (nếu winner khác mySymbol)
        • "Hòa" (nếu winner === "draw")
    → Hiển thị button "Chơi lại"
    ↓
[SERVER: socketHandlers.js]
    → updateGameStats(room) được gọi (async)
    ↓
    ┌──────────────────────────────────────────┐
    │  CẬP NHẬT DATABASE                      │
    └──────────────────────────────────────────┘
        ↓
        → Lặp qua từng player trong room
        ↓
        → Kiểm tra player.userId (bỏ qua guests)
        ↓
        ⚠️ TH1: Draw (Hòa)
            ↓
            → UPDATE game_stats SET
                draws = draws + 1,
                games_played = games_played + 1
              WHERE user_id = $1

        ✅ TH2: Winner (Thắng)
            ↓
            → UPDATE game_stats SET
                wins = wins + 1,
                games_played = games_played + 1,
                current_streak = current_streak + 1,
                highest_streak = GREATEST(highest_streak, current_streak + 1)
              WHERE user_id = $1

        ❌ TH3: Loser (Thua)
            ↓
            → UPDATE game_stats SET
                losses = losses + 1,
                games_played = games_played + 1,
                current_streak = 0
              WHERE user_id = $1
        ↓
        → Lưu game history:
            INSERT INTO game_history (
              game_mode, player1_id, player2_id, player3_id,
              winner_id, result, moves_count, duration, board_state
            ) VALUES (...)
        ↓
        → Log: "Game stats updated"
    ↓
    → setTimeout(5000) - Đợi 5 giây
    ↓
    → gameManager.deleteRoom(room.id)
    → Xóa room khỏi memory
    → Xóa playerRooms mapping
    ↓
    [Room cleaned up]
```

### 🎯 Flow: User muốn chơi lại

```
[User click "Chơi lại"]
    ↓
[GameView.js]
    → handlePlayAgain() được gọi
    ↓
[socket.js]
    → socketService.leaveGame()
    → socket.emit('leaveGame')
    ↓
[SERVER: socketHandlers.js]
    → Event 'leaveGame' received
    → gameManager.removePlayer(socket.id)
    → gameManager.removeFromQueues(socket.id)
    ↓
[Client: GameView.js]
    → socketService.findGame(mode)
    → Reset gameState về waiting
    → Bắt đầu tìm trận mới (quay lại phần 4)
```

### 🎯 Flow: User rời game giữa chừng

```
[User click "Quay lại" hoặc đóng browser]
    ↓
[GameView.js - useEffect cleanup]
    → socketService.leaveGame()
    → socket.emit('leaveGame')
    ↓
    HOẶC
    ↓
[Browser đóng]
    → Socket.IO tự động disconnect
    → Event 'disconnect' fired
    ↓
[SERVER: socketHandlers.js]
    → Event 'disconnect' received
    → gameManager.removeFromQueues(socket.id)
    → const room = gameManager.removePlayer(socket.id)
    ↓
    → Nếu room tồn tại:
        → socket.to(room.id).emit('playerLeft', {
            message: "Opponent disconnected"
          })
        → gameManager.deleteRoom(room.id)
    ↓
[Client: GameView.js - CÁC PLAYERS CÒN LẠI]
    → handlePlayerLeft(data) được gọi
    → setGameState({
        gameActive: false,
        message: "Đối thủ đã rời đi"
      })
    → Game kết thúc
```

### 📂 Files Liên Quan

- **Client**:
  - `client/src/views/GameView.js`
  - `client/src/services/socket.js`
- **Server**:
  - `server/src/socket/socketHandlers.js`
  - `server/src/game/GameManager.js`
- **Database**:
  - `game_stats` table
  - `game_history` table

---

## 📊 Sơ Đồ Tổng Quan

```
┌─────────────┐
│   BROWSER   │
└──────┬──────┘
       │
       │ HTTP Requests (REST API)
       ↓
┌─────────────────────────┐
│   EXPRESS SERVER        │
│   - /api/auth/register  │ ← Authentication
│   - /api/auth/login     │
│   - /api/auth/profile   │
└────────────┬────────────┘
             │
             │ Socket.IO (WebSocket)
             ↓
┌─────────────────────────┐
│  SOCKET.IO HANDLERS     │
│   - findGame            │ ← Matchmaking
│   - makeMove            │ ← Game Logic
│   - leaveGame           │
└────────────┬────────────┘
             │
      ┌──────┴──────┐
      ↓             ↓
┌──────────┐  ┌──────────┐
│  GAME    │  │  BOT AI  │
│ MANAGER  │  │          │
└────┬─────┘  └──────────┘
     │
     ↓ SQL Queries
┌──────────────────┐
│   POSTGRESQL     │
│   - users        │
│   - game_stats   │
│   - game_history │
└──────────────────┘
```

---

## 🔑 Key Points

### Socket.IO Events (Client → Server)

1. **authenticate** - Xác thực user sau khi connect
2. **findGame** - Tìm trận đấu theo mode
3. **makeMove** - Thực hiện nước đi
4. **leaveGame** - Rời khỏi game
5. **disconnect** - Ngắt kết nối (tự động)

### Socket.IO Events (Server → Client)

1. **waiting** - Đang chờ đủ người chơi
2. **gameStart** - Game bắt đầu
3. **updateBoard** - Cập nhật bàn cờ sau mỗi nước đi
4. **gameOver** - Game kết thúc (thắng/thua/hòa)
5. **playerLeft** - Có người chơi rời đi
6. **error** - Thông báo lỗi

### Data Structures

#### Room Object

```javascript
{
  id: "room_timestamp_random",
  mode: "2player" | "3player" | "vs_bot",
  players: [
    { socketId, userId, symbol: "X" | "O" | "V", playerNum }
  ],
  board: Array(10).fill(null).map(() => Array(10).fill(null)),
  currentTurn: "X" | "O" | "V",
  gameOver: boolean,
  winner: "X" | "O" | "V" | "draw" | null,
  winnerId: number | null,
  startedAt: timestamp,
  endedAt: timestamp,
  moveCount: number
}
```

#### Game State (Client)

```javascript
{
  board: 10x10 array,
  mySymbol: "X" | "O" | "V" | null,
  currentTurn: "X" | "O" | "V" | null,
  gameActive: boolean,
  waiting: boolean,
  gameOver: boolean,
  winner: "X" | "O" | "V" | "draw" | null,
  message: string
}
```

---

## 💡 Tips Đọc Code

### Muốn hiểu Authentication?

→ Đọc: `server/src/routes/auth.js` + `client/src/services/api.js`

### Muốn hiểu Socket.IO flow?

→ Đọc: `server/src/socket/socketHandlers.js` + `client/src/services/socket.js`

### Muốn hiểu Game Logic?

→ Đọc: `server/src/game/GameLogic.js` (Win checking, board validation)

### Muốn hiểu Matchmaking?

→ Đọc: `server/src/game/GameManager.js` (Queue system, room creation)

### Muốn hiểu Bot AI?

→ Đọc: `server/src/game/BotAI.js` (AI decision making)

### Muốn hiểu UI Flow?

→ Đọc: `client/src/views/GameView.js` (Main game component)

---

## 📝 Notes

- **JWT Token** được lưu trong `localStorage` và tự động thêm vào mọi API request qua axios interceptor
- **Socket.IO** tự động reconnect nếu mất kết nối
- **Bot AI** delay 500ms để giả lập "suy nghĩ"
- **Room cleanup** sau 5 giây khi game kết thúc
- **Database transactions** không được sử dụng (có thể cải thiện)
- **Guest mode** được hỗ trợ (userId = null)

---

**Tài liệu này được tạo để giúp hiểu rõ luồng hoạt động của app từ A-Z! 🚀**
