import { Pool, PoolClient } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  max: 5,
  idleTimeoutMillis: 10000,
});

// Types matching our schema
export interface Board {
  board_id: string;
  board_name: string;
  board_description?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface BoardColumn {
  board_id: string;
  column_id: number;
  column_name: string;
  column_order: number;
  created_at: Date;
}

export interface Comment {
  comment_id: string;
  board_id: string;
  column_id: number;
  comment_text: string;
  comment_likes: number;
  created_at: Date;
  updated_at: Date;
}

export interface BoardWithColumnsAndComments extends Board {
  columns: Array<BoardColumn & { comments: Comment[] }>;
}

// Database utilities
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Board operations
export async function getBoard(boardId: string): Promise<BoardWithColumnsAndComments | null> {
  const client = await getClient();
  try {
    // Get board info
    const boardResult = await client.query(
      'SELECT * FROM boards WHERE board_id = $1',
      [boardId]
    );
    
    if (boardResult.rows.length === 0) {
      return null;
    }
    
    const board = boardResult.rows[0];
    
    // Get columns for this board
    const columnsResult = await client.query(
      `SELECT bc.*, COALESCE(json_agg(
        json_build_object(
          'comment_id', c.comment_id,
          'comment_text', c.comment_text,
          'comment_likes', c.comment_likes,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        ) ORDER BY c.created_at
       ) FILTER (WHERE c.comment_id IS NOT NULL), '[]') as comments
       FROM board_columns bc
       LEFT JOIN comments c ON bc.board_id = c.board_id AND bc.column_id = c.column_id
       WHERE bc.board_id = $1
       GROUP BY bc.board_id, bc.column_id, bc.column_name, bc.column_order, bc.created_at
       ORDER BY bc.column_order`,
      [boardId]
    );
    
    return {
      ...board,
      columns: columnsResult.rows
    };
  } finally {
    client.release();
  }
}

export async function createBoard(
  boardId: string,
  boardName: string,
  boardDescription: string,
  userId: string,
  columns: Array<{ columnName: string }>
): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    
    // Insert board
    await client.query(
      `INSERT INTO boards (board_id, board_name, board_description, user_id)
       VALUES ($1, $2, $3, $4)`,
      [boardId, boardName, boardDescription, userId]
    );
    
    // Insert columns
    for (let i = 0; i < columns.length; i++) {
      await client.query(
        `INSERT INTO board_columns (board_id, column_id, column_name, column_order)
         VALUES ($1, $2, $3, $4)`,
        [boardId, i, columns[i].columnName, i]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteBoard(boardId: string): Promise<void> {
  await query('DELETE FROM boards WHERE board_id = $1', [boardId]);
}

export async function getAllBoards(): Promise<Board[]> {
  const result = await query(`
    SELECT board_id, board_name, board_description, user_id, created_at as date_created
    FROM boards 
    ORDER BY created_at DESC
  `);
  return result.rows;
}

// Comment operations
export async function addComment(
  boardId: string,
  columnId: number,
  commentId: string,
  commentText: string
): Promise<void> {
  await query(
    `INSERT INTO comments (comment_id, board_id, column_id, comment_text, comment_likes)
     VALUES ($1, $2, $3, $4, 0)`,
    [commentId, boardId, columnId, commentText]
  );
}

export async function deleteComment(
  boardId: string,
  columnId: number,
  commentId: string
): Promise<void> {
  await query(
    'DELETE FROM comments WHERE board_id = $1 AND column_id = $2 AND comment_id = $3',
    [boardId, columnId, commentId]
  );
}

export async function updateCommentText(
  boardId: string,
  columnId: number,
  commentId: string,
  newText: string
): Promise<void> {
  await query(
    `UPDATE comments 
     SET comment_text = $4, updated_at = CURRENT_TIMESTAMP
     WHERE board_id = $1 AND column_id = $2 AND comment_id = $3`,
    [boardId, columnId, commentId, newText]
  );
}

export async function incrementCommentLikes(
  boardId: string,
  columnId: number,
  commentId: string
): Promise<void> {
  await query(
    `UPDATE comments 
     SET comment_likes = comment_likes + 1, updated_at = CURRENT_TIMESTAMP
     WHERE board_id = $1 AND column_id = $2 AND comment_id = $3`,
    [boardId, columnId, commentId]
  );
}

export async function decrementCommentLikes(
  boardId: string,
  columnId: number,
  commentId: string
): Promise<void> {
  await query(
    `UPDATE comments 
     SET comment_likes = comment_likes - 1, updated_at = CURRENT_TIMESTAMP
     WHERE board_id = $1 AND column_id = $2 AND comment_id = $3`,
    [boardId, columnId, commentId]
  );
}

export async function moveComment(
  boardId: string,
  commentId: string,
  _sourceColumnId: number,
  destinationColumnId: number,
  _commentText: string,
  _commentLikes: number
): Promise<void> {
  await query(
    'UPDATE comments SET column_id = $1 WHERE board_id = $2 AND comment_id = $3',
    [destinationColumnId, boardId, commentId]
  );
}

export async function addBoardMember(boardId: string, userId: string): Promise<void> {
  await query(
    `INSERT INTO board_members (board_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (board_id, user_id) DO NOTHING`,
    [boardId, userId]
  );
}

// Cleanup function for graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
}
