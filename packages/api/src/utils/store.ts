import { Item } from '@org/shared';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// File path for persistent storage in local dev
const STORE_FILE = join(process.cwd(), '.store', 'items.json');

// In-memory data store for local development
class InMemoryStore {
  private items: Map<string, Item>;

  constructor() {
    this.items = new Map();
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (existsSync(STORE_FILE)) {
        const data = JSON.parse(readFileSync(STORE_FILE, 'utf-8'));
        this.items = new Map(Object.entries(data));
        console.log(`Loaded ${this.items.size} items from persistent storage`);
      }
    } catch (error) {
      console.warn('Could not load from file, starting with empty store');
    }
  }

  private saveToFile(): void {
    try {
      const dir = join(process.cwd(), '.store');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const data = Object.fromEntries(this.items.entries());
      writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Could not save to file:', error);
    }
  }

  async scan(): Promise<Item[]> {
    console.log('Current items in store:', this.items.size);
    return Array.from(this.items.values());
  }

  async get(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async put(item: Item): Promise<void> {
    this.items.set(item.id, item);
    this.saveToFile();
    console.log(`Item ${item.id} added. Total items:`, this.items.size);
  }

  async update(id: string, updates: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.items.set(id, updatedItem);
    this.saveToFile();
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const result = this.items.delete(id);
    if (result) {
      this.saveToFile();
    }
    return result;
  }
}

// Use global object to ensure singleton across all Lambda invocations
// This prevents each handler from creating a new instance
declare global {
  var __inMemoryStore: InMemoryStore | undefined;
}

if (!global.__inMemoryStore) {
  console.log('Initializing InMemoryStore singleton (with file persistence)');
  global.__inMemoryStore = new InMemoryStore();
}

export const store = global.__inMemoryStore;
