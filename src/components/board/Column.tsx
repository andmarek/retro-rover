"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card, { CardData } from "./Card";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

export interface ColumnData {
  board_id: string;
  column_id: number;
  column_name: string;
  column_order: number;
  created_at: Date;
  comments: CardData[];
}

interface ColumnProps {
  column: ColumnData;
  onAddCard: (columnId: number, text: string) => void;
  onLikeCard: (columnId: number, cardId: string) => void;
  onUnlikeCard: (columnId: number, cardId: string) => void;
  onDeleteCard: (columnId: number, cardId: string) => void;
  onEditCard: (columnId: number, cardId: string, newText: string) => void;
}

interface DraggableCardProps {
  card: CardData;
  columnId: number;
  onLike: (cardId: string) => void;
  onUnlike: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  onEdit: (cardId: string, newText: string) => void;
}

function DraggableCard({ card, columnId, onLike, onUnlike, onDelete, onEdit }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${columnId}-${card.comment_id}`,
    data: {
      type: "card",
      card,
      columnId,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        card={card}
        onLike={onLike}
        onUnlike={onUnlike}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}

export default function Column({
  column,
  onAddCard,
  onLikeCard,
  onUnlikeCard,
  onDeleteCard,
  onEditCard,
}: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardText, setNewCardText] = useState("");

  const { setNodeRef } = useDroppable({
    id: `column-${column.column_id}`,
    data: {
      type: "column",
      column,
    },
  });

  const handleAddCard = () => {
    if (newCardText.trim()) {
      onAddCard(column.column_id, newCardText.trim());
      setNewCardText("");
      setIsAddingCard(false);
    }
  };

  const handleCancelAdd = () => {
    setNewCardText("");
    setIsAddingCard(false);
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-50 rounded-lg p-4 min-h-[400px] w-80 flex-shrink-0"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{column.column_name}</h3>
        <span className="text-sm text-gray-500">{column.comments.length}</span>
      </div>

      <div className="space-y-3 mb-4">
        {column.comments.map((card) => (
          <DraggableCard
            key={card.comment_id}
            card={card}
            columnId={column.column_id}
            onLike={(cardId) => onLikeCard(column.column_id, cardId)}
            onUnlike={(cardId) => onUnlikeCard(column.column_id, cardId)}
            onDelete={(cardId) => onDeleteCard(column.column_id, cardId)}
            onEdit={(cardId, newText) => onEditCard(column.column_id, cardId, newText)}
          />
        ))}
      </div>

      {isAddingCard ? (
        <div className="space-y-2">
          <textarea
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            placeholder="Add a card..."
            className="w-full p-2 border border-gray-300 rounded resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelAdd}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddCard}
            >
              Add Card
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setIsAddingCard(true)}
          className="w-full justify-start text-gray-500 hover:text-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a card
        </Button>
      )}
    </div>
  );
}
