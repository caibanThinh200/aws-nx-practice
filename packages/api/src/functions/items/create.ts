import { APIGatewayProxyHandler } from 'aws-lambda';
import { CreateItemDto, Item } from '@org/shared';
import { randomUUID } from 'crypto';
import { db } from '../../utils/db';

const TABLE_NAME = process.env.ITEMS_TABLE || 'items-local';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
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

    const data: CreateItemDto = JSON.parse(event.body);

    if (!data.name || !data.description) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Name and description are required',
        }),
      };
    }

    const now = new Date().toISOString();
    const item: Item = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      createdAt: now,
      updatedAt: now,
    };

    await db.put(TABLE_NAME, item);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: item,
        message: 'Item created successfully',
      }),
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to create item',
      }),
    };
  }
};
