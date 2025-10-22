/**
 * GAME LOGIC - CORE FUNCTIONS
 * 10x10 board, 2-3 players, Win checking
 */

const BOARD_SIZE = 10;
const WIN_LENGTH = 5;

class GameLogic {
  /**
   * Create empty 10x10 board
   */
  static createEmptyBoard() {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null));
  }

  /**
   * Check if a move is valid
   */
  static isValidMove(board, row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return false;
    }
    return board[row][col] === null;
  }

  /**
   * Check for winner after a move
   * Returns true if player wins
   */
  static checkWinner(board, row, col, symbol) {
    // 4 directions: horizontal, vertical, diagonal \, diagonal /
    const directions = [
      { dr: 0, dc: 1 }, // Horizontal →
      { dr: 1, dc: 0 }, // Vertical ↓
      { dr: 1, dc: 1 }, // Diagonal \
      { dr: 1, dc: -1 }, // Diagonal /
    ];

    for (const { dr, dc } of directions) {
      let count = 1; // Count current cell

      // Count forward
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

      // Count backward
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

      if (count >= WIN_LENGTH) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if board is full (draw)
   */
  static isBoardFull(board) {
    return board.every((row) => row.every((cell) => cell !== null));
  }

  /**
   * Get next turn symbol
   * For 2 players: X -> O -> X
   * For 3 players: X -> O -> V -> X
   */
  static getNextTurn(currentTurn, playerCount) {
    if (playerCount === 2) {
      return currentTurn === "X" ? "O" : "X";
    } else if (playerCount === 3) {
      if (currentTurn === "X") return "O";
      if (currentTurn === "O") return "V";
      return "X";
    }
    return "X";
  }

  /**
   * Get all empty cells
   */
  static getEmptyCells(board) {
    const emptyCells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }

  /**
   * Count consecutive symbols in a direction
   */
  static countInDirection(board, row, col, dr, dc, symbol) {
    let count = 0;
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

    return count;
  }

  /**
   * Find winning move for a symbol
   * Returns {row, col} if found, null otherwise
   */
  static findWinningMove(board, symbol) {
    const emptyCells = this.getEmptyCells(board);

    for (const { row, col } of emptyCells) {
      // Temporarily place symbol
      board[row][col] = symbol;

      // Check if it wins
      if (this.checkWinner(board, row, col, symbol)) {
        board[row][col] = null; // Undo
        return { row, col };
      }

      board[row][col] = null; // Undo
    }

    return null;
  }

  /**
   * Find cells with N consecutive symbols in any direction
   */
  static findNInARow(board, symbol, n) {
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 },
    ];

    const threats = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) continue;

        for (const { dr, dc } of directions) {
          // Count symbols in this direction
          const forward = this.countInDirection(
            board,
            row,
            col,
            dr,
            dc,
            symbol
          );
          const backward = this.countInDirection(
            board,
            row,
            col,
            -dr,
            -dc,
            symbol
          );
          const total = forward + backward;

          if (total >= n - 1) {
            threats.push({ row, col, priority: total });
          }
        }
      }
    }

    // Sort by priority (highest first)
    threats.sort((a, b) => b.priority - a.priority);
    return threats;
  }
}

module.exports = GameLogic;
