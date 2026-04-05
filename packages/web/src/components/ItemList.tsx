import { Item } from '@org/shared';
import { twMerge } from 'tailwind-merge';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ItemList({
  items,
  onEdit,
  onDelete,
  isLoading,
}: ItemListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No items found</p>
        <p className="text-sm mt-2">Create your first item to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={twMerge(
            'bg-white rounded-lg shadow-md p-6',
            'hover:shadow-lg transition-shadow duration-200'
          )}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {item.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
          <div className="text-xs text-gray-400 mb-4">
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className={twMerge(
                'flex-1 px-4 py-2 bg-blue-500 text-white rounded-md',
                'hover:bg-blue-600 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className={twMerge(
                'flex-1 px-4 py-2 bg-red-500 text-white rounded-md',
                'hover:bg-red-600 transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              )}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
