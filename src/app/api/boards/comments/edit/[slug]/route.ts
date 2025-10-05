import { NextRequest } from "next/server";
import { updateCommentText } from "@/app/lib/postgres";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const data = await request.json();

    const commentId = params.slug;
    const boardId = data.boardId;
    const columnId = parseInt(data.columnId); // Convert to number
    const editedCommentText = data.editedCommentText;

    await updateCommentText(boardId, columnId, commentId, editedCommentText);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating comment:", error);
    return Response.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
