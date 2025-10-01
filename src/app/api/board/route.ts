import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

import { tableName, getBoard } from "@/app/lib/dynamo";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);

interface ColumnInput {
  columnName: string;
  comments: {};
}

interface ColumnFormData {
  columnName: string;
}

interface PutBoard {
  boardId: string;
  boardName: string;
  boardDescription: string;
  columnsInput: { [columnId: string]: ColumnInput };
  userId: string;
}

/* Create a new board */
export async function PUT(request: Request) {
  const reqBodyJson = await request.json();

  const userId: string = reqBodyJson.userId as string;
  const boardId: string = reqBodyJson.boardId as string;
  const boardName: string = reqBodyJson.boardName as string;
  const boardDescription: string = reqBodyJson.boardDescription as string;
  const boardColumns: [{ columnName: string }] = reqBodyJson.boardColumns;

  // Change representation to dictionary in order to store in DynamoDB
  // and retrieve more effectively.
  const columnsInputDict: { [columnId: string]: ColumnInput } = {};
  boardColumns.map((column, index) => (
    columnsInputDict[index] = {
      columnName: column.columnName,
      comments: {},
    }
  ))

  const command = new PutCommand({
    TableName: tableName as string,
    Item: {
      BoardId: boardId,
      BoardName: boardName,
      UserId: userId,
      BoardColumns: columnsInputDict,
      Date: new Date().toISOString(),
      BoardDescription: boardDescription,
    },
  });
  const response = await docClient.send(command);

  return Response.json(response);
}

/* Get a board by board Id  and user ID*/
export async function POST(request: Request) {
  const reqBodyJson = await request.json();
  const boardId: string = reqBodyJson.boardId as string;
  const response = await getBoard(tableName, boardId);
  return Response.json(response);
}

/* Delete a board by boardId */
export async function DELETE(request: Request) {
  const reqBodyJson = await request.json();
  const boardId: string = reqBodyJson.boardId as string;
  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      BoardId: boardId,
    },
  });
  const response = await docClient.send(command);
  return Response.json(response);
}
