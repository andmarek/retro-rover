import { NextRequest } from "next/server";
import { incrementCommentLikes, decrementCommentLikes } from "@/app/lib/postgres";

function getCommentIdFromPath(pathName: string) {
  const pathParts = pathName.split("/");
  return pathParts.pop();
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const boardId = data.boardId;
    const columnId = parseInt(data.columnId);
    const commentId = getCommentIdFromPath(request.nextUrl.pathname);

    if (!commentId) {
      return Response.json({ error: 'Comment ID not found' }, { status: 400 });
    }

    await incrementCommentLikes(boardId, columnId, commentId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error incrementing comment likes:', error);
    return Response.json({ error: 'Failed to increment likes' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();

    const boardId = data.boardId;
    const columnId = parseInt(data.columnId);
    const commentId = getCommentIdFromPath(request.nextUrl.pathname);

    if (!commentId) {
      return Response.json({ error: 'Comment ID not found' }, { status: 400 });
    }

    await decrementCommentLikes(boardId, columnId, commentId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error decrementing comment likes:', error);
    return Response.json({ error: 'Failed to decrement likes' }, { status: 500 });
  }
}
