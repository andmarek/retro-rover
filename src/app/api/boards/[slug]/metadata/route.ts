import { NextRequest, NextResponse } from "next/server";
import { getBoard } from "@/app/lib/postgres";

/* Get the boards metadata by ID */
export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const boardId: string = params.slug;

    console.log("Getting board metadata for:", boardId);
    const board = await getBoard(boardId);
    
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const boardMetadata = {
      boardId: board.board_id,
      boardName: board.board_name,
    };
    
    console.log("Board metadata:", boardMetadata);
    return Response.json(boardMetadata);
  } catch (error) {
    console.error("Error getting board metadata:", error);
    return NextResponse.json(
      { error: "Failed to get board metadata" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Implement GET endpoint if needed
    return NextResponse.json({ message: "GET endpoint not implemented" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
