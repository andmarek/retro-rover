import { 
  getBoard, 
  createBoard, 
  deleteBoard 
} from "@/app/lib/postgres";

interface ColumnFormData {
  columnName: string;
}

/* Create a new board */
export async function PUT(request: Request) {
  try {
    const reqBodyJson = await request.json();

    const userId: string = reqBodyJson.userId as string;
    const boardId: string = reqBodyJson.boardId as string;
    const boardName: string = reqBodyJson.boardName as string;
    const boardDescription: string = reqBodyJson.boardDescription as string;
    const boardColumns: [{ columnName: string }] = reqBodyJson.boardColumns;

    await createBoard(boardId, boardName, boardDescription, userId, boardColumns);

    return Response.json({ success: true, boardId });
  } catch (error) {
    console.error('Error creating board:', error);
    return Response.json({ error: 'Failed to create board' }, { status: 500 });
  }
}

/* Get a board by board Id  and user ID*/
export async function POST(request: Request) {
  try {
    const reqBodyJson = await request.json();
    const boardId: string = reqBodyJson.boardId as string;
    const board = await getBoard(boardId);
    
    if (!board) {
      return Response.json({ error: 'Board not found' }, { status: 404 });
    }
    
    return Response.json({ Item: board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return Response.json({ error: 'Failed to fetch board' }, { status: 500 });
  }
}

/* Delete a board by boardId */
export async function DELETE(request: Request) {
  try {
    const reqBodyJson = await request.json();
    const boardId: string = reqBodyJson.boardId as string;
    
    await deleteBoard(boardId);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return Response.json({ error: 'Failed to delete board' }, { status: 500 });
  }
}
