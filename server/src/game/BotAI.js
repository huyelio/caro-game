/**
 * BOT AI - INTELLIGENT OPPONENT
 * Strategy: Win > Block > Attack > Random
 */

const GameLogic = require("./GameLogic");

class BotAI {
  /**
   * Find best move for bot
   * @param {Array} board - Current board state
   * @param {String} botSymbol - Bot's symbol ('O' or 'V')
   * @param {Array} allSymbols - All player symbols in game
   * @returns {Object} {row, col} or null
   */
  static findBestMove(board, botSymbol, allSymbols = ["X", "O"]) {
    console.log(`🤖 Bot (${botSymbol}) is thinking...`);

    // Priority 1: WIN if possible
    const winMove = GameLogic.findWinningMove(board, botSymbol);
    if (winMove) {
      console.log(
        `🤖 Bot found WINNING move at (${winMove.row}, ${winMove.col})`
      );
      return winMove;
    }

    // Priority 2: BLOCK opponent's winning moves
    const opponentSymbols = allSymbols.filter((s) => s !== botSymbol);
    for (const opponentSymbol of opponentSymbols) {
      const blockMove = GameLogic.findWinningMove(board, opponentSymbol);
      if (blockMove) {
        console.log(
          `🤖 Bot BLOCKING ${opponentSymbol} at (${blockMove.row}, ${blockMove.col})`
        );
        return blockMove;
      }
    }

    // Priority 3: ATTACK - Create threats (4-in-a-row)
    const attackMoves = GameLogic.findNInARow(board, botSymbol, 4);
    if (attackMoves.length > 0) {
      const move = attackMoves[0];
      console.log(`🤖 Bot ATTACKING at (${move.row}, ${move.col})`);
      return move;
    }

    // Priority 4: DEFEND - Block opponent's threats (4-in-a-row)
    for (const opponentSymbol of opponentSymbols) {
      const defenseMoves = GameLogic.findNInARow(board, opponentSymbol, 4);
      if (defenseMoves.length > 0) {
        const move = defenseMoves[0];
        console.log(
          `🤖 Bot DEFENDING against ${opponentSymbol} at (${move.row}, ${move.col})`
        );
        return move;
      }
    }

    // Priority 5: Build - Create 3-in-a-row
    const buildMoves = GameLogic.findNInARow(board, botSymbol, 3);
    if (buildMoves.length > 0) {
      const move = buildMoves[0];
      console.log(`🤖 Bot BUILDING at (${move.row}, ${move.col})`);
      return move;
    }

    // Priority 6: STRATEGIC - Place near existing symbols
    const strategicMove = this.findStrategicMove(board, botSymbol);
    if (strategicMove) {
      console.log(
        `🤖 Bot playing STRATEGIC move at (${strategicMove.row}, ${strategicMove.col})`
      );
      return strategicMove;
    }

    // Priority 7: RANDOM - Last resort
    const randomMove = this.findRandomMove(board);
    if (randomMove) {
      console.log(
        `🤖 Bot playing RANDOM move at (${randomMove.row}, ${randomMove.col})`
      );
      return randomMove;
    }

    console.log("🤖 Bot found no valid moves");
    return null;
  }

  /**
   * Find a strategic move near existing pieces
   */
  static findStrategicMove(board, botSymbol) {
    const BOARD_SIZE = board.length;
    const CENTER = Math.floor(BOARD_SIZE / 2);

    // Try center first if empty
    if (board[CENTER][CENTER] === null) {
      return { row: CENTER, col: CENTER };
    }

    // Find all non-empty cells
    const occupiedCells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) {
          occupiedCells.push({ row, col });
        }
      }
    }

    // If board is empty, play center
    if (occupiedCells.length === 0) {
      return { row: CENTER, col: CENTER };
    }

    // Find empty cells adjacent to occupied cells
    const adjacentMoves = [];
    const directions = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 0 },
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
    ];

    for (const { row, col } of occupiedCells) {
      for (const { dr, dc } of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (
          newRow >= 0 &&
          newRow < BOARD_SIZE &&
          newCol >= 0 &&
          newCol < BOARD_SIZE &&
          board[newRow][newCol] === null
        ) {
          // Calculate distance from center (prefer center)
          const distanceFromCenter =
            Math.abs(newRow - CENTER) + Math.abs(newCol - CENTER);

          adjacentMoves.push({
            row: newRow,
            col: newCol,
            distance: distanceFromCenter,
          });
        }
      }
    }

    // Sort by distance from center (closest first)
    adjacentMoves.sort((a, b) => a.distance - b.distance);

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const move of adjacentMoves) {
      const key = `${move.row},${move.col}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(move);
      }
    }

    return unique.length > 0 ? unique[0] : null;
  }

  /**
   * Find a random empty cell
   */
  static findRandomMove(board) {
    const emptyCells = GameLogic.getEmptyCells(board);

    if (emptyCells.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }
}

module.exports = BotAI;
