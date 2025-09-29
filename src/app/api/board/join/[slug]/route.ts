import { NextRequest, NextResponse } from "next/server";
import { tableName, getBoard } from "@/app/lib/dynamo";

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const reqJson = await request.json();
    console.log("Join request received:", reqJson);

    const boardId: string = params.slug;

    // Verify the board exists
    const dynamoBoardResponse = await getBoard(tableName, boardId);
    
    if (!dynamoBoardResponse.Item) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    console.log("Board found, granting access");
    return NextResponse.json({ message: "Access granted" }, { status: 200 });
    
  } catch (error) {
    console.error("Error in join API:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
