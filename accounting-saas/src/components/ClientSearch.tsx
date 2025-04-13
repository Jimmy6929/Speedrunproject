import { ChangeEvent } from 'react';

interface ClientSearchProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function ClientSearch({
  search,
  setSearch
}: ClientSearchProps) {
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
} 