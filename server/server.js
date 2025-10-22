/**
 * CARO GAME SERVER
 * Kiến trúc: Client-Server với Socket.IO
 * Chức năng: Matchmaking, quản lý rooms, validate moves, check win/lose
 */

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const BOARD_SIZE = 5;

// Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, "../public")));

// Data structure để quản lý rooms và game state
const waitingPlayers = []; // Queue người chơi đang đợi
const rooms = new Map(); // Map<roomId, GameRoom>

/**
 * GameRoom structure:
 * {
 *   id: string,
 *   players: [{socketId, symbol, playerNum}],
 *   board: array[5][5],
 *   currentTurn: 'X' or 'O',
 *   gameOver: boolean,
 *   winner: 'X', 'O', or 'draw'
 * }
 */

// ===== HELPER FUNCTIONS =====

/**
 * Tạo bàn cờ trống 5x5
 */
function createEmptyBoard() {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
}

/**
 * Kiểm tra thắng thua
 * Cờ caro: 5 ô liên tiếp (ngang, dọc, chéo)
 */
function checkWinner(board, row, col, symbol) {
  // Kiểm tra 4 hướng: ngang, dọc, chéo chính, chéo phụ
  const directions = [
    { dr: 0, dc: 1 }, // Ngang
    { dr: 1, dc: 0 }, // Dọc
    { dr: 1, dc: 1 }, // Chéo chính (\)
    { dr: 1, dc: -1 }, // Chéo phụ (/)
  ];

  for (let { dr, dc } of directions) {
    let count = 1; // Đếm ô hiện tại

    // Đếm về phía trước
    let r = row + dr;
    let c = col + dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === symbol
    ) {
      count++;
      r += dr;
      c += dc;
    }

    // Đếm về phía sau
    r = row - dr;
    c = col - dc;
    while (
      r >= 0 &&
      r < BOARD_SIZE &&
      c >= 0 &&
      c < BOARD_SIZE &&
      board[r][c] === symbol
    ) {
      count++;
      r -= dr;
      c -= dc;
    }

    // Nếu có 5 ô liên tiếp → Thắng
    if (count >= 5) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra bàn cờ đầy (hòa)
 */
function isBoardFull(board) {
  return board.every((row) => row.every((cell) => cell !== null));
}

/**
 * Validate nước đi
 */
function isValidMove(room, row, col, socketId) {
  // Kiểm tra game đã kết thúc chưa
  if (room.gameOver) {
    return { valid: false, error: "Game đã kết thúc!" };
  }

  // Kiểm tra có phải lượt của người chơi không
  const player = room.players.find((p) => p.socketId === socketId);
  if (!player) {
    return { valid: false, error: "Bạn không trong phòng này!" };
  }

  if (player.symbol !== room.currentTurn) {
    return { valid: false, error: "Chưa đến lượt của bạn!" };
  }

  // Kiểm tra vị trí hợp lệ
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return { valid: false, error: "Vị trí không hợp lệ!" };
  }

  // Kiểm tra ô đã được đánh chưa
  if (room.board[row][col] !== null) {
    return { valid: false, error: "Ô này đã có người đánh!" };
  }

  return { valid: true };
}

/**
 * Tạo room mới cho 2 người chơi
 */
function createRoom(player1, player2) {
  const roomId = `room_${Date.now()}`;

  const room = {
    id: roomId,
    players: [
      { socketId: player1, symbol: "X", playerNum: 1 },
      { socketId: player2, symbol: "O", playerNum: 2 },
    ],
    board: createEmptyBoard(),
    currentTurn: "X", // X đi trước
    gameOver: false,
    winner: null,
  };

  rooms.set(roomId, room);

  // Cho cả 2 players join room (Socket.IO room)
  io.sockets.sockets.get(player1)?.join(roomId);
  io.sockets.sockets.get(player2)?.join(roomId);

  return room;
}

/**
 * Xóa room
 */
function deleteRoom(roomId) {
  rooms.delete(roomId);
}

/**
 * Tìm room của một socket
 */
function findRoomBySocketId(socketId) {
  for (let [roomId, room] of rooms) {
    if (room.players.some((p) => p.socketId === socketId)) {
      return room;
    }
  }
  return null;
}

// ===== SOCKET.IO EVENT HANDLERS =====

io.on("connection", (socket) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] ✅ Client connected: ${socket.id}`
  );

  /**
   * Event: findMatch
   * Client yêu cầu tìm trận đấu
   */
  socket.on("findMatch", () => {
    console.log(
      `[${new Date().toLocaleTimeString()}] 🔍 ${socket.id} đang tìm trận...`
    );

    // Kiểm tra xem người chơi đã trong room nào chưa
    const existingRoom = findRoomBySocketId(socket.id);
    if (existingRoom) {
      socket.emit("error", { message: "Bạn đang trong một trận đấu!" });
      return;
    }

    // Thêm vào queue chờ
    waitingPlayers.push(socket.id);

    // Nếu có đủ 2 người → Tạo room
    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      const room = createRoom(player1, player2);

      console.log(
        `[${new Date().toLocaleTimeString()}] 🎮 Room created: ${room.id}`
      );
      console.log(`   Player 1 (X): ${player1}`);
      console.log(`   Player 2 (O): ${player2}`);

      // Gửi thông tin game start cho cả 2 players
      io.to(player1).emit("gameStart", {
        roomId: room.id,
        yourSymbol: "X",
        opponentSymbol: "O",
        currentTurn: "X",
        board: room.board,
        message: "Trận đấu bắt đầu! Bạn là X (đi trước)",
      });

      io.to(player2).emit("gameStart", {
        roomId: room.id,
        yourSymbol: "O",
        opponentSymbol: "X",
        currentTurn: "X",
        board: room.board,
        message: "Trận đấu bắt đầu! Bạn là O (đi sau)",
      });
    } else {
      socket.emit("waiting", { message: "Đang chờ đối thủ..." });
    }
  });

  /**
   * Event: makeMove
   * Client gửi nước đi
   */
  socket.on("makeMove", ({ row, col }) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] 🎯 ${
        socket.id
      } đánh (${row}, ${col})`
    );

    const room = findRoomBySocketId(socket.id);
    if (!room) {
      socket.emit("error", { message: "Bạn không trong phòng nào!" });
      return;
    }

    // Validate nước đi
    const validation = isValidMove(room, row, col, socket.id);
    if (!validation.valid) {
      socket.emit("error", { message: validation.error });
      return;
    }

    // Thực hiện nước đi
    const player = room.players.find((p) => p.socketId === socket.id);
    room.board[row][col] = player.symbol;

    // Kiểm tra thắng
    const hasWon = checkWinner(room.board, row, col, player.symbol);

    if (hasWon) {
      room.gameOver = true;
      room.winner = player.symbol;

      console.log(
        `[${new Date().toLocaleTimeString()}] 🏆 ${player.symbol} thắng!`
      );

      // Gửi kết quả cho cả 2 players
      io.to(room.id).emit("updateBoard", {
        board: room.board,
        row,
        col,
        symbol: player.symbol,
        currentTurn: null,
      });

      io.to(room.id).emit("gameOver", {
        winner: player.symbol,
        message: `${player.symbol} thắng! 🎉`,
      });

      // Xóa room sau 5 giây
      setTimeout(() => deleteRoom(room.id), 5000);
      return;
    }

    // Kiểm tra hòa
    if (isBoardFull(room.board)) {
      room.gameOver = true;
      room.winner = "draw";

      console.log(`[${new Date().toLocaleTimeString()}] 🤝 Hòa!`);

      io.to(room.id).emit("updateBoard", {
        board: room.board,
        row,
        col,
        symbol: player.symbol,
        currentTurn: null,
      });

      io.to(room.id).emit("gameOver", {
        winner: "draw",
        message: "Hòa! 🤝",
      });

      setTimeout(() => deleteRoom(room.id), 5000);
      return;
    }

    // Chuyển lượt
    room.currentTurn = room.currentTurn === "X" ? "O" : "X";

    // Broadcast board mới cho cả 2 players
    io.to(room.id).emit("updateBoard", {
      board: room.board,
      row,
      col,
      symbol: player.symbol,
      currentTurn: room.currentTurn,
    });

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ Nước đi hợp lệ. Lượt tiếp: ${
        room.currentTurn
      }`
    );
  });

  /**
   * Event: disconnect
   * Client ngắt kết nối
   */
  socket.on("disconnect", () => {
    console.log(
      `[${new Date().toLocaleTimeString()}] ❌ Client disconnected: ${
        socket.id
      }`
    );

    // Xóa khỏi waiting queue
    const waitingIndex = waitingPlayers.indexOf(socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
      console.log(`   Removed from waiting queue`);
    }

    // Tìm room và thông báo cho đối thủ
    const room = findRoomBySocketId(socket.id);
    if (room) {
      const opponent = room.players.find((p) => p.socketId !== socket.id);
      if (opponent) {
        io.to(opponent.socketId).emit("opponentLeft", {
          message: "Đối thủ đã rời khỏi trận đấu!",
        });
      }
      deleteRoom(room.id);
      console.log(`   Room ${room.id} deleted`);
    }
  });

  /**
   * Event: rematch
   * Yêu cầu chơi lại
   */
  socket.on("rematch", () => {
    // Tự động tìm trận mới
    socket.emit("rematchReady");
  });
});

// ===== START SERVER =====

server.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🎮 CARO GAME SERVER STARTED");
  console.log("=".repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 Open browser and navigate to the URL above`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log("=".repeat(50));
});
