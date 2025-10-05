import { Pool } from "pg";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          b.board_id,
          b.board_name,
          b.board_description,
          b.created_at,
          b.updated_at,
          COUNT(DISTINCT c.comment_id) as item_count,
          ARRAY_AGG(
            jsonb_build_object(
              'column_id', bc.column_id,
              'column_name', bc.column_name,
              'column_order', bc.column_order
            ) ORDER BY bc.column_order
          ) FILTER (WHERE bc.column_id IS NOT NULL) as columns
        FROM boards b
        LEFT JOIN board_columns bc ON b.board_id = bc.board_id
        LEFT JOIN comments c ON b.board_id = c.board_id
        WHERE b.user_id = $1
        GROUP BY b.board_id, b.board_name, b.board_description, b.created_at, b.updated_at
        ORDER BY b.updated_at DESC
      `;

      const result = await client.query(query, [session.user.id]);
      
      const boards = result.rows.map(row => ({
        id: row.board_id,
        name: row.board_name,
        description: row.board_description,
        status: "active", // You may want to add a status field to your schema
        template: row.columns?.[0] ? getTemplateFromColumns(row.columns) : "Custom",
        lastModified: new Date(row.updated_at),
        itemCount: parseInt(row.item_count) || 0,
        columns: row.columns || []
      }));

      return NextResponse.json(boards);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, template } = body;

    if (!name || !template) {
      return NextResponse.json(
        { error: "Board name and template are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query("BEGIN");

      // Generate board ID
      const boardId = uuidv4();

      // Insert board
      const boardQuery = `
        INSERT INTO boards (board_id, board_name, board_description, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const boardResult = await client.query(boardQuery, [
        boardId,
        name,
        description || null,
        session.user.id
      ]);

      // Get template columns
      const templateColumns = getTemplateColumns(template);
      
      // Insert board columns
      for (let i = 0; i < templateColumns.length; i++) {
        const columnQuery = `
          INSERT INTO board_columns (column_id, board_id, column_name, column_order)
          VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(columnQuery, [
          i + 1, // column_id starts from 1
          boardId,
          templateColumns[i],
          i + 1 // column_order starts from 1
        ]);
      }

      // Skip board_members for now

      // Commit transaction
      await client.query("COMMIT");

      const createdBoard = {
        id: boardResult.rows[0].board_id,
        name: boardResult.rows[0].board_name,
        description: boardResult.rows[0].board_description,
        status: "active",
        template: getTemplateNameFromValue(template),
        lastModified: new Date(boardResult.rows[0].created_at),
        itemCount: 0,
        columns: templateColumns.map((name, index) => ({
          column_id: index + 1,
          column_name: name,
          column_order: index + 1
        }))
      };

      return NextResponse.json(createdBoard, { status: 201 });

    } catch (error) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}

function getTemplateColumns(templateValue: string): string[] {
  const templates: Record<string, string[]> = {
    "start-stop-continue": ["Start", "Stop", "Continue"],
    "mad-sad-glad": ["Mad", "Sad", "Glad"],
    "4ls": ["Liked", "Learned", "Lacked", "Longed For"],
    "sailboat": ["Anchors", "Wind", "Rocks", "Island"],
    "what-went-well": ["What Went Well", "What Needs Improvement", "Action Items"],
  };
  
  return templates[templateValue] || ["Column 1", "Column 2", "Column 3"];
}

function getTemplateNameFromValue(templateValue: string): string {
  const templateNames: Record<string, string> = {
    "start-stop-continue": "Start/Stop/Continue",
    "mad-sad-glad": "Mad/Sad/Glad",
    "4ls": "4Ls (Liked/Learned/Lacked/Longed)",
    "sailboat": "Sailboat",
    "what-went-well": "What Went Well / What Needs Improvement",
  };
  
  return templateNames[templateValue] || "Custom";
}

function getTemplateFromColumns(columns: any[]): string {
  const columnNames = columns.map(col => col.column_name).sort();
  
  // Common templates based on column names
  if (columnNames.includes("Start") && columnNames.includes("Stop") && columnNames.includes("Continue")) {
    return "Start/Stop/Continue";
  }
  if (columnNames.includes("Mad") && columnNames.includes("Sad") && columnNames.includes("Glad")) {
    return "Mad/Sad/Glad";
  }
  if (columnNames.includes("Liked") && columnNames.includes("Learned") && columnNames.includes("Lacked") && columnNames.includes("Longed")) {
    return "4Ls (Liked/Learned/Lacked/Longed)";
  }
  if (columnNames.includes("What went well") && columnNames.includes("What could be improved")) {
    return "Two Column";
  }
  
  return "Custom";
}
