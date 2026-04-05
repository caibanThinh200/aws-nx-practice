import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Item } from '@org/shared';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ITEMS_TABLE || '';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    const items = (response.Items || []) as Item[];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: items,
      }),
    };
  } catch (error) {
    console.error('Error listing items:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to list items',
      }),
    };
  }
};
