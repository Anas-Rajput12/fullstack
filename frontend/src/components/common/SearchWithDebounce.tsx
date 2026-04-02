import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

// Mock API call
const searchAPI = async (query: string) => {
  console.log('API call for:', query);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return [{ id: 1, name: `Result for "${query}"` }];
};

/**
 * Example component demonstrating useDebounce in a search input
 * 
 * Without debounce: API called on every keystroke (bad for performance)
 * With debounce: API called only after user stops typing for 300ms
 */
export function SearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Debounce the search term by 300ms
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchAPI(debouncedSearchTerm);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  return (
    <div className="p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search campaigns..."
        className="border border-gray-300 rounded px-4 py-2 w-full max-w-md"
      />
      
      {loading && <p>Loading...</p>}
      
      <ul className="mt-4">
        {results.map((result) => (
          <li key={result.id} className="py-2">
            {result.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchExample;
