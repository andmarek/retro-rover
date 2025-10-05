"use client";

import { useEffect, useState, useCallback } from "react";
import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import Column, { ColumnData } from "./Column";
import { CardData } from "./Card";
import { BoardWithColumnsAndComments } from "@/app/lib/postgres";
import { webSocketManager } from "@/lib/websocket";

interface BoardProps {
  boardId: string;
}

export default function Board({ boardId }: BoardProps) {
  const [boardData, setBoardData] = useState<BoardWithColumnsAndComments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch board data");
      }

      const data = await response.json();
      setBoardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardData();
    
    // Setup WebSocket connection (prepared for future server implementation)
    webSocketManager.connect(boardId);
    
    // Setup real-time event listeners
    webSocketManager.on("board-update", () => {
      console.log("[WebSocket] Board update received, refreshing data");
      fetchBoardData();
    });

    webSocketManager.on("card-added", () => {
      console.log("[WebSocket] Card added, refreshing data");
      fetchBoardData();
    });

    webSocketManager.on("card-moved", () => {
      console.log("[WebSocket] Card moved, refreshing data");
      fetchBoardData();
    });

    webSocketManager.on("card-liked", () => {
      console.log("[WebSocket] Card liked, refreshing data");
      fetchBoardData();
    });

    // Cleanup on unmount
    return () => {
      webSocketManager.off("board-update");
      webSocketManager.off("card-added");
      webSocketManager.off("card-moved");
      webSocketManager.off("card-liked");
      webSocketManager.disconnect();
    };
  }, [fetchBoardData, boardId]);

  // creates a comment Id which is a uuid
  const generateCommentId = () => {
    return crypto.randomUUID();
  };

  const handleAddCard = async (columnId: number, text: string) => {
    try {
      const response = await fetch("/api/boards/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId,
          commentText: text,
          commentId: generateCommentId(),
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleLikeCard = async (columnId: number, cardId: string) => {
    try {
      const response = await fetch(`/api/boards/comments/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: cardId,
          columnId,
          action: "like",
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error liking card:", error);
    }
  };

  const handleUnlikeCard = async (columnId: number, cardId: string) => {
    try {
      const response = await fetch(`/api/boards/comments/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: cardId,
          columnId,
          action: "unlike",
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error unliking card:", error);
    }
  };

  const handleDeleteCard = async (columnId: number, cardId: string) => {
    try {
      const response = await fetch("/api/boards/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardId,
          columnId,
          commentId: cardId,
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleEditCard = async (columnId: number, cardId: string, newText: string) => {
    try {
      const response = await fetch(`/api/boards/comments/edit/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: cardId,
          columnId,
          newText,
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error editing card:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) return;

    const draggedCard = active.data.current.card as CardData;
    const sourceColumnId = active.data.current.columnId as number;
    const targetColumnId = parseInt(over.id.toString().split("-")[1]);

    if (sourceColumnId === targetColumnId) return;

    try {
      const response = await fetch(`/api/boards/comments/move/${boardId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: draggedCard.comment_id,
          sourceColumnId,
          destinationColumnId: targetColumnId,
          commentText: draggedCard.comment_text,
          commentLikes: draggedCard.comment_likes,
        }),
      });

      if (response.ok) {
        await fetchBoardData(); // Refresh board data
      }
    } catch (error) {
      console.error("Error moving card:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchBoardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!boardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Board not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{boardData.board_name}</h1>
          {boardData.board_description && (
            <p className="text-gray-600 mt-2">{boardData.board_description}</p>
          )}
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {boardData.columns.map((column) => (
              <Column
                key={column.column_id}
                column={column}
                onAddCard={handleAddCard}
                onLikeCard={handleLikeCard}
                onUnlikeCard={handleUnlikeCard}
                onDeleteCard={handleDeleteCard}
                onEditCard={handleEditCard}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
