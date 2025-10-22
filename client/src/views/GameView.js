import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import socketService from "../services/socket";
import "./GameView.css";

const BOARD_SIZE = 10;

function GameView({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const [gameState, setGameState] = useState({
    board: Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null)),
    mySymbol: null,
    currentTurn: null,
    gameActive: false,
    waiting: false,
    gameOver: false,
    winner: null,
    message: "",
  });

  useEffect(() => {
    if (!mode) {
      navigate("/");
      return;
    }

    // Connect to socket
    const socket = socketService.connect(user?.id);

    // Setup event listeners
    socket.on("waiting", handleWaiting);
    socket.on("gameStart", handleGameStart);
    socket.on("updateBoard", handleUpdateBoard);
    socket.on("gameOver", handleGameOver);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("error", handleError);

    // Find game
    socketService.findGame(mode);

    return () => {
      // Cleanup
      socket.off("waiting", handleWaiting);
      socket.off("gameStart", handleGameStart);
      socket.off("updateBoard", handleUpdateBoard);
      socket.off("gameOver", handleGameOver);
      socket.off("playerLeft", handlePlayerLeft);
      socket.off("error", handleError);
      socketService.leaveGame();
    };
  }, [mode, user, navigate]);

  const handleWaiting = (data) => {
    setGameState((prev) => ({
      ...prev,
      waiting: true,
      message: data.message,
    }));
  };

  const handleGameStart = (data) => {
    console.log("Game started:", data);
    setGameState((prev) => ({
      ...prev,
      board: data.board,
      mySymbol: data.yourSymbol,
      currentTurn: data.currentTurn,
      gameActive: true,
      waiting: false,
      message: data.message,
    }));
  };

  const handleUpdateBoard = (data) => {
    setGameState((prev) => ({
      ...prev,
      board: data.board,
      currentTurn: data.currentTurn,
    }));
  };

  const handleGameOver = (data) => {
    setGameState((prev) => ({
      ...prev,
      gameActive: false,
      gameOver: true,
      winner: data.winner,
      message: data.message,
    }));
  };

  const handlePlayerLeft = (data) => {
    setGameState((prev) => ({
      ...prev,
      gameActive: false,
      message: data.message,
    }));
  };

  const handleError = (data) => {
    alert(data.message);
  };

  const handleCellClick = (row, col) => {
    if (!gameState.gameActive) return;
    if (gameState.currentTurn !== gameState.mySymbol) return;
    if (gameState.board[row][col] !== null) return;

    socketService.makeMove(row, col);
  };

  const handleLeaveGame = () => {
    socketService.leaveGame();
    navigate("/");
  };

  const handlePlayAgain = () => {
    socketService.leaveGame();
    socketService.findGame(mode);
    setGameState({
      board: Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null)),
      mySymbol: null,
      currentTurn: null,
      gameActive: false,
      waiting: true,
      gameOver: false,
      winner: null,
      message: "Finding new game...",
    });
  };

  const renderSymbol = (symbol) => {
    if (symbol === "X") return "❌";
    if (symbol === "O") return "⭕";
    if (symbol === "V") return "✅";
    return "";
  };

  const getGameModeName = () => {
    if (mode === "2player") return "2 Players";
    if (mode === "3player") return "3 Players";
    if (mode === "vs_bot") return "vs Bot";
    return "";
  };

  return (
    <div className="game-view fade-in">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <button className="btn-back" onClick={handleLeaveGame}>
            ← Leave Game
          </button>
          <h1 className="game-title">🎮 {getGameModeName()}</h1>
          <div className="game-mode-badge">{mode}</div>
        </div>

        {/* Status Panel */}
        <div className="status-panel card">
          {gameState.waiting && (
            <div className="status-waiting">
              <div className="spinner-small"></div>
              <p>{gameState.message}</p>
            </div>
          )}

          {gameState.gameActive && (
            <div className="status-playing">
              <div className="player-turn">
                <span className="turn-label">Current Turn:</span>
                <span className="turn-symbol">
                  {renderSymbol(gameState.currentTurn)}
                </span>
              </div>
              <div className="your-symbol">
                <span className="your-label">You are:</span>
                <span className="your-symbol-value">
                  {renderSymbol(gameState.mySymbol)}
                </span>
              </div>
              {gameState.currentTurn === gameState.mySymbol && (
                <div className="your-turn-indicator">🎯 Your Turn!</div>
              )}
            </div>
          )}

          {gameState.gameOver && !gameState.waiting && (
            <div className="status-gameover">
              <div className="gameover-icon">
                {gameState.winner === gameState.mySymbol
                  ? "🏆"
                  : gameState.winner === "draw"
                  ? "🤝"
                  : "😢"}
              </div>
              <p className="gameover-message">{gameState.message}</p>
              <button className="btn btn-primary" onClick={handlePlayAgain}>
                🔄 Play Again
              </button>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="board-wrapper">
          <div className="board-container">
            <div className="board">
              {gameState.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell ? "filled" : ""} ${
                      !gameState.gameActive ||
                      gameState.currentTurn !== gameState.mySymbol
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell && (
                      <span className="cell-symbol">{renderSymbol(cell)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions card">
          <h3>📜 How to Play</h3>
          <ul>
            <li>Click on an empty cell to place your symbol</li>
            <li>
              Get 5 symbols in a row (horizontal, vertical, or diagonal) to win
            </li>
            <li>Take turns with your opponent(s)</li>
            <li>
              {mode === "vs_bot"
                ? "The bot will play automatically"
                : "Wait for your turn"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GameView;
