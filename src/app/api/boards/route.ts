import { getAllBoards } from "@/app/lib/postgres";

export async function GET() {
  try {
    const boards = await getAllBoards();
    
    const boardsMetadata = boards.map((board) => ({
      BoardId: board.board_id,
      BoardName: board.board_name,
      BoardDescription: board.board_description,
      DateCreated: board.created_at,
    }));

    return Response.json(boardsMetadata);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return Response.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}
