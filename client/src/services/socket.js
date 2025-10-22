/**
 * SOCKET.IO SERVICE
 * Manage WebSocket connection to game server
 */

import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId = null) {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to game server:", this.socket.id);
      this.connected = true;

      // Authenticate if user is logged in
      if (userId) {
        this.socket.emit("authenticate", { userId });
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from game server");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected;
  }

  // ===== GAME EVENTS =====

  findGame(mode) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("findGame", { mode });
  }

  makeMove(row, col) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("makeMove", { row, col });
  }

  leaveGame() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("leaveGame");
  }

  getStats() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("getStats");
  }

  // ===== EVENT LISTENERS =====

  on(event, callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.off(event, callback);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
