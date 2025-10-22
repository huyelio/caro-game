/**
 * CARO GAME CLIENT
 * Xử lý giao diện, kết nối Socket.IO, và tương tác với server
 */

// ===== GAME STATE =====
let socket;
let gameState = {
  roomId: null,
  mySymbol: null,
  opponentSymbol: null,
  currentTurn: null,
  board: [],
  gameActive: false,
  connected: false,
};

// ===== DOM ELEMENTS =====
const elements = {
  board: document.getElementById("board"),
  findMatchBtn: document.getElementById("findMatchBtn"),
  rematchBtn: document.getElementById("rematchBtn"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  messageBox: document.getElementById("messageBox"),
  turnIndicator: document.getElementById("turnIndicator"),
  connectionStatus: document.getElementById("connectionStatus"),
  gameOverModal: document.getElementById("gameOverModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMessage: document.getElementById("modalMessage"),
  modalIcon: document.getElementById("modalIcon"),
  playerX: document.getElementById("playerX"),
  playerO: document.getElementById("playerO"),
  statusX: document.getElementById("statusX"),
  statusO: document.getElementById("statusO"),
};

// ===== INITIALIZATION =====

/**
 * Khởi tạo kết nối Socket.IO
 */
function initSocket() {
  socket = io();

  // Event: connect
  socket.on("connect", () => {
    console.log("✅ Connected to server:", socket.id);
    gameState.connected = true;
    updateConnectionStatus(true);
    showMessage("Kết nối thành công! Sẵn sàng chơi.", "success");
  });

  // Event: disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
    gameState.connected = false;
    updateConnectionStatus(false);
    showMessage("Mất kết nối với server!", "error");
    resetGame();
  });

  // Event: waiting
  socket.on("waiting", (data) => {
    console.log("⏳ Waiting for opponent...");
    showMessage(data.message, "info");
    updateTurnIndicator("Đang tìm đối thủ... ⏳");
    elements.findMatchBtn.disabled = true;
    elements.findMatchBtn.textContent = "⏳ Đang chờ...";
  });

  // Event: gameStart
  socket.on("gameStart", (data) => {
    console.log("🎮 Game started!", data);

    gameState.roomId = data.roomId;
    gameState.mySymbol = data.yourSymbol;
    gameState.opponentSymbol = data.opponentSymbol;
    gameState.currentTurn = data.currentTurn;
    gameState.board = data.board;
    gameState.gameActive = true;

    renderBoard();
    updatePlayerStatus();
    updateTurnIndicator();
    showMessage(data.message, "success");

    elements.findMatchBtn.style.display = "none";
    elements.rematchBtn.style.display = "none";
  });

  // Event: updateBoard
  socket.on("updateBoard", (data) => {
    console.log("📋 Board updated:", data);

    gameState.board = data.board;
    gameState.currentTurn = data.currentTurn;

    renderBoard();
    updatePlayerStatus();
    updateTurnIndicator();

    // Animation cho ô vừa đánh
    if (data.row !== undefined && data.col !== undefined) {
      const cell = document.querySelector(
        `[data-row="${data.row}"][data-col="${data.col}"]`
      );
      if (cell) {
        cell.classList.add("filled");
      }
    }
  });

  // Event: gameOver
  socket.on("gameOver", (data) => {
    console.log("🏁 Game over:", data);

    gameState.gameActive = false;
    gameState.currentTurn = null;

    updatePlayerStatus();
    updateTurnIndicator("Trận đấu kết thúc!");

    // Hiển thị modal
    showGameOverModal(data);

    // Hiện nút chơi lại
    elements.rematchBtn.style.display = "inline-flex";
  });

  // Event: opponentLeft
  socket.on("opponentLeft", (data) => {
    console.log("👋 Opponent left");
    showMessage(data.message, "error");
    gameState.gameActive = false;
    updateTurnIndicator("Đối thủ đã rời đi");
    elements.findMatchBtn.style.display = "inline-flex";
    elements.findMatchBtn.disabled = false;
    elements.findMatchBtn.innerHTML =
      '<span class="btn-icon">🔍</span> Tìm trận đấu';
    elements.rematchBtn.style.display = "none";
  });

  // Event: error
  socket.on("error", (data) => {
    console.error("❌ Error:", data.message);
    showMessage(data.message, "error");
  });

  // Event: rematchReady
  socket.on("rematchReady", () => {
    resetGame();
    findMatch();
  });
}

/**
 * Tạo bàn cờ 5x5
 */
function createBoard() {
  elements.board.innerHTML = "";

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Event handler cho click
      cell.addEventListener("click", () => handleCellClick(row, col));

      elements.board.appendChild(cell);
    }
  }
}

/**
 * Render lại bàn cờ
 */
function renderBoard() {
  const cells = elements.board.querySelectorAll(".cell");

  cells.forEach((cell) => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const value = gameState.board[row][col];

    // Clear classes
    cell.classList.remove("filled", "disabled");

    // Hiển thị X hoặc O
    if (value === "X") {
      cell.innerHTML = "<span>❌</span>";
      cell.classList.add("filled");
    } else if (value === "O") {
      cell.innerHTML = "<span>⭕</span>";
      cell.classList.add("filled");
    } else {
      cell.innerHTML = "";
    }

    // Disable nếu không phải lượt mình hoặc game đã kết thúc
    if (!gameState.gameActive || gameState.currentTurn !== gameState.mySymbol) {
      cell.classList.add("disabled");
    }
  });
}

// ===== EVENT HANDLERS =====

/**
 * Xử lý khi click vào ô
 */
function handleCellClick(row, col) {
  // Kiểm tra điều kiện
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

  // Gửi nước đi lên server
  console.log(`🎯 Making move at (${row}, ${col})`);
  socket.emit("makeMove", { row, col });
}

/**
 * Tìm trận đấu
 */
function findMatch() {
  if (!gameState.connected) {
    showMessage("Chưa kết nối với server!", "error");
    return;
  }

  console.log("🔍 Finding match...");
  socket.emit("findMatch");
}

/**
 * Chơi lại
 */
function rematch() {
  console.log("🔄 Requesting rematch...");
  closeGameOverModal();
  resetGame();
  socket.emit("rematch");
  socket.emit("findMatch");
}

/**
 * Reset game state
 */
function resetGame() {
  gameState = {
    roomId: null,
    mySymbol: null,
    opponentSymbol: null,
    currentTurn: null,
    board: Array(5)
      .fill(null)
      .map(() => Array(5).fill(null)),
    gameActive: false,
    connected: gameState.connected,
  };

  createBoard();
  updatePlayerStatus();
  updateTurnIndicator('Nhấn "Tìm trận đấu" để bắt đầu');

  elements.findMatchBtn.style.display = "inline-flex";
  elements.findMatchBtn.disabled = false;
  elements.findMatchBtn.innerHTML =
    '<span class="btn-icon">🔍</span> Tìm trận đấu';
  elements.rematchBtn.style.display = "none";
}

// ===== UI UPDATES =====

/**
 * Cập nhật connection status
 */
function updateConnectionStatus(connected) {
  const statusDot = elements.connectionStatus.querySelector(".status-dot");
  const statusText = elements.connectionStatus.querySelector(".status-text");

  if (connected) {
    statusDot.classList.add("connected");
    statusText.textContent = "Đã kết nối";
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Mất kết nối";
  }
}

/**
 * Hiển thị message
 */
function showMessage(message, type = "info") {
  elements.messageBox.textContent = message;
  elements.messageBox.className = `message-box ${type}`;

  // Auto hide sau 3 giây (trừ error)
  if (type !== "error") {
    setTimeout(() => {
      elements.messageBox.textContent = "";
      elements.messageBox.className = "message-box";
    }, 3000);
  }
}

/**
 * Cập nhật turn indicator
 */
function updateTurnIndicator(customText = null) {
  const turnText = elements.turnIndicator.querySelector(".turn-text");

  if (customText) {
    turnText.textContent = customText;
    return;
  }

  if (!gameState.gameActive) {
    turnText.textContent = "Trận đấu chưa bắt đầu";
    return;
  }

  if (gameState.currentTurn === gameState.mySymbol) {
    turnText.textContent = `🎯 Lượt của bạn (${gameState.mySymbol})`;
    turnText.style.animation = "pulse 1.5s ease infinite";
  } else {
    turnText.textContent = `⏳ Đối thủ đang suy nghĩ... (${gameState.currentTurn})`;
    turnText.style.animation = "none";
  }
}

/**
 * Cập nhật player status
 */
function updatePlayerStatus() {
  // Reset active state
  elements.playerX.classList.remove("active");
  elements.playerO.classList.remove("active");

  if (!gameState.gameActive) {
    elements.statusX.textContent = "Đang chờ...";
    elements.statusO.textContent = "Đang chờ...";
    return;
  }

  // Cập nhật status
  if (gameState.mySymbol === "X") {
    elements.statusX.textContent = "Bạn";
    elements.statusO.textContent = "Đối thủ";
  } else {
    elements.statusX.textContent = "Đối thủ";
    elements.statusO.textContent = "Bạn";
  }

  // Highlight người chơi đang có lượt
  if (gameState.currentTurn === "X") {
    elements.playerX.classList.add("active");
  } else if (gameState.currentTurn === "O") {
    elements.playerO.classList.add("active");
  }
}

/**
 * Hiển thị modal game over
 */
function showGameOverModal(data) {
  const modal = elements.gameOverModal;

  if (data.winner === "draw") {
    elements.modalIcon.textContent = "🤝";
    elements.modalTitle.textContent = "Hòa!";
    elements.modalMessage.textContent = "Trận đấu kết thúc với tỷ số hòa!";
  } else if (data.winner === gameState.mySymbol) {
    elements.modalIcon.textContent = "🏆";
    elements.modalTitle.textContent = "Bạn thắng!";
    elements.modalMessage.textContent = "Chúc mừng! Bạn đã giành chiến thắng!";
  } else {
    elements.modalIcon.textContent = "😢";
    elements.modalTitle.textContent = "Bạn thua!";
    elements.modalMessage.textContent = "Tiếc quá! Lần sau sẽ thắng thôi!";
  }

  modal.classList.add("show");
}

/**
 * Đóng modal game over
 */
function closeGameOverModal() {
  elements.gameOverModal.classList.remove("show");
}

// ===== EVENT LISTENERS =====

elements.findMatchBtn.addEventListener("click", findMatch);
elements.rematchBtn.addEventListener("click", rematch);
elements.playAgainBtn.addEventListener("click", rematch);

// Đóng modal khi click ngoài modal content
elements.gameOverModal.addEventListener("click", (e) => {
  if (e.target === elements.gameOverModal) {
    closeGameOverModal();
  }
});

// ===== START APPLICATION =====

document.addEventListener("DOMContentLoaded", () => {
  console.log("🎮 Caro Game Client Started");
  createBoard();
  initSocket();
  updateTurnIndicator("Đang kết nối với server...");
});
