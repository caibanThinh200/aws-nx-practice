import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { UpdateItemDto, Item } from '@org/shared';

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

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Request body is required',
        }),
      };
    }

    const data: UpdateItemDto = JSON.parse(event.body);

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

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.name !== undefined) {
      updateExpressions.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = data.name;
    }

    if (data.description !== undefined) {
      updateExpressions.push('#description = :description');
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':description'] = data.description;
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(updateCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: response.Attributes as Item,
        message: 'Item updated successfully',
      }),
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to update item',
      }),
    };
  }
};
