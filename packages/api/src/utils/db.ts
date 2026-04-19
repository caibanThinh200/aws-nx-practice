import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand 
} from '@aws-sdk/lib-dynamodb';
import { store } from './store';

const isOffline = process.env.IS_OFFLINE === 'true';

// DynamoDB client setup
const client = new DynamoDBClient({
  ...(isOffline && {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  }),
});

const docClient = DynamoDBDocumentClient.from(client);

export const db = {
  async scan(tableName: string) {
    if (isOffline) {
      const items = await store.scan();
      return { Items: items };
    }
    const command = new ScanCommand({ TableName: tableName });
    return docClient.send(command);
  },

  async get(tableName: string, key: Record<string, any>) {
    if (isOffline) {
      const item = await store.get(key.id);
      return { Item: item };
    }
    const command = new GetCommand({ TableName: tableName, Key: key });
    return docClient.send(command);
  },

  async put(tableName: string, item: any) {
    if (isOffline) {
      await store.put(item);
      return store.get(item?.id);
    }
    const command = new PutCommand({ TableName: tableName, Item: item });
    return docClient.send(command);
  },

  async update(tableName: string, key: Record<string, any>, updateExpression: string, expressionAttributeNames: Record<string, string>, expressionAttributeValues: Record<string, any>) {
    if (isOffline) {
      const updates: Record<string, any> = {};
      
      // Parse update expression to extract field updates
      Object.keys(expressionAttributeValues).forEach((valueKey) => {
        const fieldKey = Object.keys(expressionAttributeNames).find(
          (nameKey) => updateExpression.includes(nameKey)
        );
        if (fieldKey) {
          const fieldName = expressionAttributeNames[fieldKey];
          updates[fieldName] = expressionAttributeValues[valueKey];
        }
      });
      
      const item = await store.update(key.id, updates);
      return { Attributes: item };
    }
    
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    return docClient.send(command);
  },

  async delete(tableName: string, key: Record<string, any>) {
    if (isOffline) {
      await store.delete(key.id);
      return {};
    }
    const command = new DeleteCommand({ TableName: tableName, Key: key });
    return docClient.send(command);
  },
};
