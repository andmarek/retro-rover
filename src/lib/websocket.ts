"use client";

import { io, Socket } from "socket.io-client";

export interface WebSocketMessage {
  type: string;
  boardId: string;
  data: any;
}

class WebSocketManager {
  private socket: Socket | null = null;
  private boardId: string | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  connect(boardId: string) {
    if (this.socket && this.boardId === boardId) {
      return; // Already connected to this board
    }

    this.disconnect(); // Disconnect from previous board if any
    this.boardId = boardId;

    // TODO: Replace with actual WebSocket server URL when implemented
    // For now, this is just the structure for future implementation
    console.log(`[WebSocket] Planning to connect to board: ${boardId}`);
    
    // When WebSocket server is ready, uncomment and update:
    /*
    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001", {
      transports: ["websocket"],
      query: { boardId },
    });

    this.socket.on("connect", () => {
      console.log(`[WebSocket] Connected to board: ${boardId}`);
    });

    this.socket.on("disconnect", () => {
      console.log(`[WebSocket] Disconnected from board: ${boardId}`);
    });

    this.socket.on("board-update", (data) => {
      const listener = this.listeners.get("board-update");
      if (listener) {
        listener(data);
      }
    });

    this.socket.on("card-added", (data) => {
      const listener = this.listeners.get("card-added");
      if (listener) {
        listener(data);
      }
    });

    this.socket.on("card-moved", (data) => {
      const listener = this.listeners.get("card-moved");
      if (listener) {
        listener(data);
      }
    });

    this.socket.on("card-liked", (data) => {
      const listener = this.listeners.get("card-liked");
      if (listener) {
        listener(data);
      }
    });
    */
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.boardId = null;
      console.log("[WebSocket] Disconnected");
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback);
  }

  off(event: string) {
    this.listeners.delete(event);
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.log(`[WebSocket] Would emit ${event}:`, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketManager = new WebSocketManager();
