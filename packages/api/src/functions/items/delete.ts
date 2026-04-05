import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ITEMS_TABLE || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Item ID is required',
        }),
      };
    }

    // Check if item exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const existingItem = await docClient.send(getCommand);

    if (!existingItem.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Item not found',
        }),
      };
    }

    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    await docClient.send(deleteCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Item deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to delete item',
      }),
    };
  }
};
