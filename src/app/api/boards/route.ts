import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { tableName } from "@/app/lib/dynamo";

const ddb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddb);

export async function GET() {
  const command = new ScanCommand({
    TableName: tableName as string,
  });

  const response = await docClient.send(command);
  const boards = response.Items;
  console.log(boards)

  const boardsMetadata = boards.map((board) => {
    return {
      BoardId: board.BoardId,
      BoardName: board.BoardName,
      BoardDescription: board.BoardDescription,
      DateCreated: board.Date,
    }
  });

  console.log(boardsMetadata);
  return Response.json(boardsMetadata);
}
