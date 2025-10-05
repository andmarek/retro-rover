import { moveComment } from "@/app/lib/postgres";

export async function POST(request: Request) {
  try {
    const req = await request.json();

    const boardId: string = req.boardId;
    const sourceColumnId: number = parseInt(req.sourceColumnId); // Convert to number
    const destinationColumnId: number = parseInt(req.destinationColumnId); // Convert to number
    const commentId: string = req.sourceCommentId;
    const commentText: string = req.commentText;
    const commentLikes: number = parseInt(req.commentLikes); // Convert to number

    console.log(
      "Moving comment:",
      sourceColumnId,
      destinationColumnId,
      commentId,
      commentText,
      commentLikes
    );

    await moveComment(
      boardId,
      commentId,
      sourceColumnId,
      destinationColumnId,
      commentText,
      commentLikes
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error moving comment:", error);
    return Response.json(
      { error: "Failed to move comment" },
      { status: 500 }
    );
  }
}
