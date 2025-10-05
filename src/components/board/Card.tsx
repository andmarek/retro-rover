"use client";

import { useState } from "react";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CardData {
  comment_id: string;
  comment_text: string;
  comment_likes: number;
  created_at: Date;
  updated_at: Date;
}

interface CardProps {
  card: CardData;
  onLike: (cardId: string) => void;
  onUnlike: (cardId: string) => void;
  onDelete: (cardId: string) => void;
  onEdit: (cardId: string, newText: string) => void;
}

export default function Card({ card, onLike, onUnlike, onDelete, onEdit }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(card.comment_text);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      onUnlike(card.comment_id);
    } else {
      onLike(card.comment_id);
    }
    setIsLiked(!isLiked);
  };

  const handleSaveEdit = () => {
    if (editText.trim() !== card.comment_text) {
      onEdit(card.comment_id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(card.comment_text);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-800 mb-3">{card.comment_text}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{card.comment_likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-500"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-gray-500"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
