/**
 * GAME MANAGER - Room & State Management
 * Handles matchmaking for 2-player and 3-player modes
 */

const GameLogic = require("./GameLogic");

class GameManager {
  constructor() {
    this.waitingPlayers2 = []; // Queue for 2-player mode
    this.waitingPlayers3 = []; // Queue for 3-player mode
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // socketId -> roomId
  }

  /**
   * Add player to matchmaking queue
   */
  addToQueue(socketId, mode, userId = null) {
    const player = { socketId, userId, joinedAt: Date.now() };

    if (mode === "2player") {
      this.waitingPlayers2.push(player);
      return this.waitingPlayers2.length;
    } else if (mode === "3player") {
      this.waitingPlayers3.push(player);
      return this.waitingPlayers3.length;
    }

    return 0;
  }

  /**
   * Remove player from all queues
   */
  removeFromQueues(socketId) {
    this.waitingPlayers2 = this.waitingPlayers2.filter(
      (p) => p.socketId !== socketId
    );
    this.waitingPlayers3 = this.waitingPlayers3.filter(
      (p) => p.socketId !== socketId
    );
  }

  /**
   * Try to create a 2-player match
   */
  tryCreate2PlayerMatch() {
    if (this.waitingPlayers2.length >= 2) {
      const player1 = this.waitingPlayers2.shift();
      const player2 = this.waitingPlayers2.shift();

      return this.createRoom([player1, player2], "2player");
    }
    return null;
  }

  /**
   * Try to create a 3-player match
   */
  tryCreate3PlayerMatch() {
    if (this.waitingPlayers3.length >= 3) {
      const player1 = this.waitingPlayers3.shift();
      const player2 = this.waitingPlayers3.shift();
      const player3 = this.waitingPlayers3.shift();

      return this.createRoom([player1, player2, player3], "3player");
    }
    return null;
  }

  /**
   * Create a new game room
   */
  createRoom(players, mode) {
    const roomId = `room_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const symbols = ["X", "O", "V"];

    const room = {
      id: roomId,
      mode,
      players: players.map((player, index) => ({
        socketId: player.socketId,
        userId: player.userId,
        symbol: symbols[index],
        playerNum: index + 1,
      })),
      board: GameLogic.createEmptyBoard(),
      currentTurn: "X", // X always starts
      gameOver: false,
      winner: null,
      startedAt: Date.now(),
      moveCount: 0,
    };

    this.rooms.set(roomId, room);

    // Map players to room
    players.forEach((player) => {
      this.playerRooms.set(player.socketId, roomId);
    });

    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by player socket ID
   */
  getRoomByPlayer(socketId) {
    const roomId = this.playerRooms.get(socketId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  /**
   * Remove player from room
   */
  removePlayer(socketId) {
    const roomId = this.playerRooms.get(socketId);
    if (roomId) {
      this.playerRooms.delete(socketId);
      const room = this.rooms.get(roomId);
      return room;
    }
    return null;
  }

  /**
   * Delete room
   */
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Remove all player mappings
      room.players.forEach((player) => {
        this.playerRooms.delete(player.socketId);
      });
      this.rooms.delete(roomId);
    }
  }

  /**
   * Make a move in a room
   */
  makeMove(roomId, socketId, row, col) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.gameOver) {
      return { success: false, error: "Game already ended" };
    }

    // Find player
    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) {
      return { success: false, error: "Player not in this room" };
    }

    // Check turn
    if (player.symbol !== room.currentTurn) {
      return { success: false, error: "Not your turn" };
    }

    // Validate move
    if (!GameLogic.isValidMove(room.board, row, col)) {
      return { success: false, error: "Invalid move" };
    }

    // Make move
    room.board[row][col] = player.symbol;
    room.moveCount++;

    // Check winner
    const hasWon = GameLogic.checkWinner(room.board, row, col, player.symbol);
    if (hasWon) {
      room.gameOver = true;
      room.winner = player.symbol;
      room.winnerId = player.userId;
      room.endedAt = Date.now();

      return {
        success: true,
        gameOver: true,
        winner: player.symbol,
        board: room.board,
      };
    }

    // Check draw
    if (GameLogic.isBoardFull(room.board)) {
      room.gameOver = true;
      room.winner = "draw";
      room.endedAt = Date.now();

      return {
        success: true,
        gameOver: true,
        winner: "draw",
        board: room.board,
      };
    }

    // Switch turn
    const playerCount = room.players.length;
    room.currentTurn = GameLogic.getNextTurn(room.currentTurn, playerCount);

    return {
      success: true,
      gameOver: false,
      board: room.board,
      currentTurn: room.currentTurn,
    };
  }

  /**
   * Get game statistics
   */
  getStats() {
    return {
      activeRooms: this.rooms.size,
      waiting2Player: this.waitingPlayers2.length,
      waiting3Player: this.waitingPlayers3.length,
      totalPlayers: this.playerRooms.size,
    };
  }
}

module.exports = GameManager;
