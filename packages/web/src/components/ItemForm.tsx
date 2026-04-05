import { useState, useEffect } from 'react';
import { Item, CreateItemDto } from '@org/shared';
import { twMerge } from 'tailwind-merge';

interface ItemFormProps {
  item?: Item | null;
  onSubmit: (data: CreateItemDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ItemForm({
  item,
  onSubmit,
  onCancel,
  isSubmitting,
}: ItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {item ? 'Edit Item' : 'Create New Item'}
      </h2>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          className={twMerge(
            'w-full px-4 py-2 border border-gray-300 rounded-md',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors duration-200'
          )}
          placeholder="Enter item name"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
          rows={4}
          className={twMerge(
            'w-full px-4 py-2 border border-gray-300 rounded-md',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors duration-200'
          )}
          placeholder="Enter item description"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={twMerge(
            'flex-1 px-6 py-2 bg-blue-500 text-white rounded-md font-medium',
            'hover:bg-blue-600 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:bg-gray-400 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
        </button>
        {item && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={twMerge(
              'flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium',
              'hover:bg-gray-300 transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              'disabled:bg-gray-100 disabled:cursor-not-allowed'
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
