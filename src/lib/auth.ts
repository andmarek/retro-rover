import { betterAuth } from "better-auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const USERS_DYNAMODB_TABLE = process.env.USERS_DYNAMODB_TABLE;

// Custom user creation function for DynamoDB
async function createUserIfNotExists(userId: string) {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: USERS_DYNAMODB_TABLE,
    Item: {
      UserId: userId,
      Boards: []
    },
    ConditionExpression: "attribute_not_exists(UserId)",
  };

  try {
    const result = await docClient.send(new PutCommand(params));
    console.log("User created successfully:", result);
  } catch (error: any) {
    if (error.name === "ConditionalCheckFailedException") {
      console.log("User already exists with this userId.");
    } else {
      console.error("Error creating user:", error);
    }
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  user: {
    changeEmail: {
      enabled: true,
    },
  },

  // Note: Better-Auth doesn't have native DynamoDB support
  // We'll implement user creation in the API routes instead of hooks for now
});

export type Session = typeof auth.$Infer.Session;
