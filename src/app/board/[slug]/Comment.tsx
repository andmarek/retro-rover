import { useState } from "react";
import { Flex, Text, Dialog, Button, TextArea } from "@radix-ui/themes";
import {
  Pencil1Icon,
  TrashIcon,
  HeartFilledIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import CommentButtonIcon from "./CommentButtonIcon";
import { useDraggable } from "@dnd-kit/core";

interface CommentObject {
  comment_text: string;
  comment_likes: number;
}

interface CommentProps {
  boardId: string;
  userId: string;
  columnId: string;
  commentId: string;
  commentObj: CommentObject;
  dispatch: Function;
  socket: any; // TODO: specify a more detailed type if possible
  cardTextBlurred: boolean;
}

export default function Comment({
  boardId,
  userId,
  columnId,
  commentId,
  commentObj,
  dispatch,
  socket,
  cardTextBlurred,
}: CommentProps) {


  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${columnId}_${commentId}`,
    data: commentObj,
  });

  const style = transform && typeof transform.x === 'number' && typeof transform.y === 'number' ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  /* TODO: use comment text from reducer */
  const [currentText, setCurrentText] = useState(commentObj.comment_text);

  const [currentEditedText, setCurrentEditedText] = useState("");

  const [commentLiked, setCommentLiked] = useState(false);

  const blurPlaceholder = "***";

  async function removeCommentLikedInDatabase(
    columnId: string,
    commentId: string,
    boardId: string
  ) {
    console.log(columnId, commentId);
    const response = await fetch(`/api/board/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardId,
        columnId,
      }),
    });
    const data = await response.json();
    console.log(data);
  }

  async function updateCommentLikesInDatabase(
    columnId: string,
    commentId: string,
    boardId: string,
    userId: string
  ) {
    console.log("columnId " + columnId + "commentId " + commentId);

    const response = await fetch(`/api/board/comments/${commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardId,
        userId,
        columnId,
      }),
    });
    const data = await response.json();
    console.log(data);
  }

  async function deleteCommentFromDatabase(
    columnId: string,
    commentId: string,
    userId: string
  ) {
    console.log("Deleting from database");
    console.log(columnId, commentId);
    const response = await fetch("/api/board/comments", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardId,
        userId,
        columnId,
        commentId,
      }),
    });
    const data = await response.json();
    console.log(data);
  }

  async function deleteComment(commentId: string) {
    dispatch({
      type: "DELETE_COMMENT_FROM_COLUMN",
      payload: { columnId, commentId },
    });
    try {
      socket.emit("delete comment", {
        columnId,
        commentId,
      });
      await deleteCommentFromDatabase(columnId, commentId, userId);
    } catch (error) {
      console.error("Failed to delete comment from database. ", error);
    }
  }
  function handleLike() {
    console.log("handling like");

    dispatch({
      type: "INCREMENT_LIKES_ON_COMMENT",
      payload: { columnId, commentId },
    });
    updateCommentLikesInDatabase(columnId, commentId, boardId, userId);
  }

  function handleUnlike() {
    dispatch({
      type: "DECREMENT_LIKES_ON_COMMENT",
      payload: { columnId, commentId },
    });
    removeCommentLikedInDatabase(columnId, commentId, boardId);
  }

  function openEditCommentModal() { }

  async function handleEditCommentDialog(
    editedCommentText: string,
    boardId: string,
    columnId: string,
    commentId: string,
    userId: string
  ) {
    const response = await fetch(`/api/board/comments/edit/${commentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardId,
        columnId,
        userId,
        editedCommentText,
      }),
    });

    if (response.ok) {
      dispatch({
        type: "UPDATE_COMMENT_TEXT",
        payload: {
          columnId,
          newText: editedCommentText,
        },
      });
      setCurrentText(currentEditedText);
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Flex
        direction="column"
        gap="4"
        className="bg-magenta-light p-1 rounded-md drop-shadow-md"
      >
        <Text className={`${cardTextBlurred ? "blur-sm" : "blur-none"}`} as="p">
          {" "}
          {cardTextBlurred ? blurPlaceholder : currentText}{" "}
        </Text>
        <Flex gap="3" justify="end">
          {commentLiked ? (
            <CommentButtonIcon
              icon={<HeartFilledIcon />}
              onClick={() => {
                setCommentLiked(!commentLiked);
                handleUnlike();
              }}
            />
          ) : (
            <CommentButtonIcon
              icon={<HeartIcon />}
              onClick={() => {
                setCommentLiked(!commentLiked);
                handleLike();
              }}
            />
          )}
          <p className="text-radix-mintDefault"> {commentObj.comment_likes} </p>
          <Dialog.Root>
            <Dialog.Trigger>
              <CommentButtonIcon
                icon={<Pencil1Icon />}
                onClick={() => openEditCommentModal()}
              />
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title> Edit Comment </Dialog.Title>
              <Flex direction="column" gap="3">
                <label>
                  <TextArea
                    onChange={(e) => setCurrentEditedText(e.target.value)}
                    defaultValue={currentText}
                  />
                </label>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="mint">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button
                    onClick={() =>
                      handleEditCommentDialog(
                        currentEditedText,
                        boardId,
                        columnId,
                        commentId,
                        userId
                      )
                    }
                    color="plum"
                  >
                    Save
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          <CommentButtonIcon
            icon={<TrashIcon />}
            onClick={() => deleteComment(commentId)}
          />
        </Flex>
      </Flex>
    </div>
  );
}
