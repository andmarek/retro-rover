import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { tableName } from "@/app/lib/dynamo";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function moveComment(
  boardId: string,
  userId: string,
  sourceColumnId: string,
  destinationColumnId: string,
  commentId: string,
  commentText: string,
  commentLikes: string
) {
  // Remove the comment from the source column
  const removeCommentFromSourceColumn = new UpdateCommand({
    TableName: tableName,
    Key: { BoardId: boardId },
    UpdateExpression:
      "REMOVE BoardColumns.#source_column_id.comments.#comment_id",
    ExpressionAttributeNames: {
      "#source_column_id": sourceColumnId,
      "#comment_id": commentId,
    },
  });

  // Add the comment to the destination column
  const addCommentToDestinationColumn = new UpdateCommand({
    TableName: tableName,
    Key: { BoardId: boardId },
    UpdateExpression:
      "SET BoardColumns.#destination_column_id.comments.#comment_id = :comment",
    ExpressionAttributeNames: {
      "#destination_column_id": destinationColumnId,
      "#comment_id": commentId,
    },
    ExpressionAttributeValues: {
      ":comment": {
        comment_text: commentText,
        comment_likes: commentLikes,
      },
    },
  });

  try {
    // Execute the commands sequentially
    await docClient.send(removeCommentFromSourceColumn);
    await docClient.send(addCommentToDestinationColumn);
    console.log("Comment moved successfully.");
  } catch (error) {
    console.error("Error moving comment:", error);
  }
}

export async function POST(request: Request) {
  const req = await request.json();

  const boardId: string = req.boardId as string;
  const userId: string = req.userId as string;

  const sourceColumnId: string = req.sourceColumnId as string;
  const destinationColumnId: string = req.destinationColumnId as string;
  const commentId: string = req.sourceCommentId as string;
  const commentText: string = req.commentText as string;
  const commentLikes: string = req.commentLikes as string;

  console.log(
    sourceColumnId,
    destinationColumnId,
    commentId,
    commentText,
    commentLikes
  );

  const moveResponse = await moveComment(
    boardId,
    userId,
    sourceColumnId,
    destinationColumnId,
    commentId,
    commentText,
    commentLikes
  );
  return Response.json({});
}
