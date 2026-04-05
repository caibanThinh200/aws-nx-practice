import { useState, useEffect } from 'react';
import { Item, CreateItemDto, ApiResponse } from '@org/shared';
import api from '../services/api';
import { ItemList } from '../components/ItemList';
import { ItemForm } from '../components/ItemForm';

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<Item[]>>('/items');
      if (response.data.success && response.data.data) {
        setItems(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateOrUpdate = async (data: CreateItemDto) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (selectedItem) {
        // Update existing item
        const response = await api.put<ApiResponse<Item>>(
          `/items/${selectedItem.id}`,
          data
        );
        if (response.data.success) {
          await fetchItems();
          setSelectedItem(null);
        }
      } else {
        // Create new item
        const response = await api.post<ApiResponse<Item>>('/items', data);
        if (response.data.success) {
          await fetchItems();
        }
      }
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setError(null);
      const response = await api.delete<ApiResponse<void>>(`/items/${id}`);
      if (response.data.success) {
        await fetchItems();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Item Manager
          </h1>
          <p className="text-gray-600">
            A serverless CRUD application with AWS Lambda, DynamoDB, and React
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <ItemForm
          item={selectedItem}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Items</h2>
          <p className="text-sm text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} total
          </p>
        </div>

        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;
