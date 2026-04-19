import { APIGatewayProxyHandler } from 'aws-lambda';
import { Item } from '@org/shared';
import { db } from '../../utils/db';

const TABLE_NAME = process.env.ITEMS_TABLE || 'items-local';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const response = await db.scan(TABLE_NAME);
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
