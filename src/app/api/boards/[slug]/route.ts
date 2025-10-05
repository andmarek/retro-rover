import { NextRequest, NextResponse } from "next/server";
import { getBoard } from "@/app/lib/postgres";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const boardId = params.slug;

    console.log("Fetching board data for:", boardId);
    
    const boardData = await getBoard(boardId);
    
    if (!boardData) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    console.log("Board data retrieved:", {
      boardId: boardData.board_id,
      columnsCount: boardData.columns.length,
    });

    return NextResponse.json(boardData);
  } catch (error) {
    console.error("Error fetching board data:", error);
    return NextResponse.json(
      { error: "Failed to fetch board data" },
      { status: 500 }
    );
  }
}
