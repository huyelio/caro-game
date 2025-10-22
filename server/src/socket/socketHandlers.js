/**
 * SOCKET.IO EVENT HANDLERS
 * Handle game events, matchmaking, moves
 */

const GameManager = require("../game/GameManager");
const BotAI = require("../game/BotAI");
const pool = require("../config/database");

const gameManager = new GameManager();

// Helper: Update game stats in database
async function updateGameStats(room) {
  if (!room.gameOver || !room.winnerId) return;

  try {
    const playerCount = room.players.length;

    for (const player of room.players) {
      if (!player.userId) continue; // Skip guests

      const isWinner = player.userId === room.winnerId;
      const isDraw = room.winner === "draw";

      if (isDraw) {
        await pool.query(
          `UPDATE game_stats 
           SET draws = draws + 1, games_played = games_played + 1 
           WHERE user_id = $1`,
          [player.userId]
        );
      } else if (isWinner) {
        await pool.query(
          `UPDATE game_stats 
           SET wins = wins + 1, games_played = games_played + 1,
               current_streak = current_streak + 1,
               highest_streak = GREATEST(highest_streak, current_streak + 1)
           WHERE user_id = $1`,
          [player.userId]
        );
      } else {
        await pool.query(
          `UPDATE game_stats 
           SET losses = losses + 1, games_played = games_played + 1,
               current_streak = 0
           WHERE user_id = $1`,
          [player.userId]
        );
      }
    }

    // Save game history
    const duration = Math.floor((room.endedAt - room.startedAt) / 1000);
    await pool.query(
      `INSERT INTO game_history 
       (game_mode, player1_id, player2_id, player3_id, winner_id, result, moves_count, duration, board_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        room.mode,
        room.players[0]?.userId,
        room.players[1]?.userId,
        room.players[2]?.userId,
        room.winnerId,
        room.winner === "draw" ? "draw" : "win",
        room.moveCount,
        duration,
        JSON.stringify(room.board),
      ]
    );
  } catch (error) {
    console.error("Error updating game stats:", error);
  }
}

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ Client connected: ${socket.id}`
    );

    // Store user info if authenticated
    socket.userId = null;

    /**
     * EVENT: authenticate
     * Client sends user info after login
     */
    socket.on("authenticate", (data) => {
      socket.userId = data.userId;
      console.log(`[${socket.id}] Authenticated as user ${data.userId}`);
    });

    /**
     * EVENT: findGame
     * Client requests to find a match
     */
    socket.on("findGame", (data) => {
      const { mode } = data; // '2player', '3player', or 'vs_bot'

      console.log(`[${socket.id}] Looking for ${mode} game`);

      // Remove from any existing queues
      gameManager.removeFromQueues(socket.id);

      if (mode === "vs_bot") {
        // Create instant bot game
        const botPlayer = { socketId: "BOT", userId: null };
        const room = gameManager.createRoom(
          [{ socketId: socket.id, userId: socket.userId }, botPlayer],
          "vs_bot"
        );

        socket.join(room.id);

        socket.emit("gameStart", {
          roomId: room.id,
          mode: "vs_bot",
          yourSymbol: "X",
          opponentSymbol: "O",
          currentTurn: "X",
          board: room.board,
          message: "Game started! You are playing against BOT",
        });

        console.log(`[${socket.id}] Bot game created: ${room.id}`);
        return;
      }

      // Add to queue
      const queueSize = gameManager.addToQueue(socket.id, mode, socket.userId);

      // Try to create match
      let room = null;
      if (mode === "2player") {
        room = gameManager.tryCreate2PlayerMatch();
      } else if (mode === "3player") {
        room = gameManager.tryCreate3PlayerMatch();
      }

      if (room) {
        // Match found!
        console.log(
          `[${new Date().toLocaleTimeString()}] 🎮 ${mode} game created: ${
            room.id
          }`
        );

        // Join all players to Socket.IO room
        room.players.forEach((player) => {
          const playerSocket = io.sockets.sockets.get(player.socketId);
          if (playerSocket) {
            playerSocket.join(room.id);

            // Send game start to each player
            playerSocket.emit("gameStart", {
              roomId: room.id,
              mode: room.mode,
              yourSymbol: player.symbol,
              players: room.players.map((p) => ({ symbol: p.symbol })),
              currentTurn: room.currentTurn,
              board: room.board,
              message: `Game started! You are ${player.symbol}`,
            });
          }
        });
      } else {
        // Still waiting
        socket.emit("waiting", {
          message: `Waiting for ${
            mode === "2player" ? "1" : "2"
          } more player(s)...`,
          queueSize,
        });
      }
    });

    /**
     * EVENT: makeMove
     * Client makes a move
     */
    socket.on("makeMove", async (data) => {
      const { row, col } = data;
      const room = gameManager.getRoomByPlayer(socket.id);

      if (!room) {
        socket.emit("error", { message: "You are not in a game" });
        return;
      }

      console.log(`[${socket.id}] Move: (${row}, ${col})`);

      // Make move
      const result = gameManager.makeMove(room.id, socket.id, row, col);

      if (!result.success) {
        socket.emit("error", { message: result.error });
        return;
      }

      // Broadcast update to all players in room
      io.to(room.id).emit("updateBoard", {
        board: result.board,
        row,
        col,
        currentTurn: result.currentTurn,
      });

      // Check game over
      if (result.gameOver) {
        io.to(room.id).emit("gameOver", {
          winner: result.winner,
          message:
            result.winner === "draw" ? "Draw!" : `${result.winner} wins! 🎉`,
        });

        // Update database
        await updateGameStats(room);

        // Clean up room after 5 seconds
        setTimeout(() => {
          gameManager.deleteRoom(room.id);
        }, 5000);

        return;
      }

      // If vs bot and bot's turn, make bot move
      if (room.mode === "vs_bot" && room.currentTurn === "O") {
        setTimeout(async () => {
          const botMove = BotAI.findBestMove(room.board, "O", ["X", "O"]);

          if (botMove) {
            const botResult = gameManager.makeMove(
              room.id,
              "BOT",
              botMove.row,
              botMove.col
            );

            if (botResult.success) {
              io.to(room.id).emit("updateBoard", {
                board: botResult.board,
                row: botMove.row,
                col: botMove.col,
                currentTurn: botResult.currentTurn,
              });

              if (botResult.gameOver) {
                io.to(room.id).emit("gameOver", {
                  winner: botResult.winner,
                  message:
                    botResult.winner === "draw"
                      ? "Draw!"
                      : botResult.winner === "O"
                      ? "Bot wins! 🤖"
                      : "You win! 🎉",
                });

                await updateGameStats(room);

                setTimeout(() => {
                  gameManager.deleteRoom(room.id);
                }, 5000);
              }
            }
          }
        }, 500); // Bot thinks for 500ms
      }
    });

    /**
     * EVENT: leaveGame
     * Client leaves current game
     */
    socket.on("leaveGame", () => {
      const room = gameManager.removePlayer(socket.id);

      if (room) {
        // Notify other players
        io.to(room.id).emit("playerLeft", {
          message: "A player left the game",
        });

        // Delete room
        gameManager.deleteRoom(room.id);
      }

      gameManager.removeFromQueues(socket.id);
    });

    /**
     * EVENT: getStats
     * Get server statistics
     */
    socket.on("getStats", () => {
      const stats = gameManager.getStats();
      socket.emit("stats", stats);
    });

    /**
     * EVENT: disconnect
     * Client disconnected
     */
    socket.on("disconnect", () => {
      console.log(
        `[${new Date().toLocaleTimeString()}] ❌ Client disconnected: ${
          socket.id
        }`
      );

      // Remove from queues
      gameManager.removeFromQueues(socket.id);

      // Handle game room
      const room = gameManager.removePlayer(socket.id);
      if (room) {
        // Notify other players
        socket.to(room.id).emit("playerLeft", {
          message: "Opponent disconnected",
        });

        // Delete room
        gameManager.deleteRoom(room.id);
      }
    });
  });
};
