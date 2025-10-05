import { addComment, deleteComment } from "@/app/lib/postgres";


export async function DELETE(request: Request) {
  try {
    const requestData = await request.json();

    const boardId: string = requestData.boardId;
    const commentId: string = requestData.commentId;
    const columnId: number = parseInt(requestData.columnId);

    await deleteComment(boardId, columnId, commentId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return Response.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    const boardId: string = requestData.boardId;
    const commentText: string = requestData.commentText;
    const commentId: string = requestData.commentId;
    const columnId: number = parseInt(requestData.columnId);

    await addComment(boardId, columnId, commentId, commentText);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error adding comment:', error);
    return Response.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
