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

    const socket = socketService.connect(user?.id);

    socket.on("waiting", handleWaiting);
    socket.on("gameStart", handleGameStart);
    socket.on("updateBoard", handleUpdateBoard);
    socket.on("gameOver", handleGameOver);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("error", handleError);

    socketService.findGame(mode);

    return () => {
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
      message: data.message || "Đang tìm đối thủ...",
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
      message: data.message || "Trò chơi đã bắt đầu!",
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
      message: data.message || "Trò chơi kết thúc!",
    }));
  };

  const handlePlayerLeft = (data) => {
    setGameState((prev) => ({
      ...prev,
      gameActive: false,
      message: data.message || "Đối thủ đã rời đi",
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
      message: "Đang tìm trận đấu mới...",
    });
  };

  const renderSymbol = (symbol) => {
    if (symbol === "X") return "X";
    if (symbol === "O") return "O";
    if (symbol === "V") return "V";
    return "";
  };

  const getGameModeName = () => {
    if (mode === "2player") return "Chế độ 2 người chơi";
    if (mode === "3player") return "Chế độ 3 người chơi";
    if (mode === "vs_bot") return "Chơi với máy";
    return "";
  };

  return (
    <div className="game-view fade-in">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <button className="btn-back" onClick={handleLeaveGame}>
            ← Quay lại
          </button>
          <h1 className="game-title">{getGameModeName()}</h1>
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
              <div className="player-info">
                <div className="info-item">
                  <span className="label">Lượt chơi:</span>
                  <span className="value symbol-{gameState.currentTurn}">
                    {renderSymbol(gameState.currentTurn)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Bạn đang chơi:</span>
                  <span className="value symbol-{gameState.mySymbol}">
                    {renderSymbol(gameState.mySymbol)}
                  </span>
                </div>
              </div>
              {gameState.currentTurn === gameState.mySymbol && (
                <div className="your-turn-indicator">Đến lượt của bạn</div>
              )}
            </div>
          )}

          {gameState.gameOver && !gameState.waiting && (
            <div className="status-gameover">
              <h2 className="result-title">
                {gameState.winner === gameState.mySymbol
                  ? "Bạn đã thắng!"
                  : gameState.winner === "draw"
                  ? "Hòa"
                  : "Bạn đã thua"}
              </h2>
              <p className="result-message">{gameState.message}</p>
              <button className="btn btn-primary" onClick={handlePlayAgain}>
                Chơi lại
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
                      cell ? `symbol-${cell}` : ""
                    } ${
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
          <h3>Luật chơi</h3>
          <ul>
            <li>Nhấp vào ô trống để đánh quân cờ</li>
            <li>
              Xếp 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng
            </li>
            <li>Lần lượt đánh theo từng người chơi</li>
            <li>
              {mode === "vs_bot"
                ? "Máy sẽ tự động đánh sau lượt của bạn"
                : "Đợi đối thủ đánh xong"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GameView;
