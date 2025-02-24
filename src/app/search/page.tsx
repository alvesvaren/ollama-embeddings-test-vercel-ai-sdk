'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SearchResult {
  content: string;
  filename: string;
  pageNumber: number;
  similarity: number;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || 'Error performing search');
      }
    } catch (error) {
      setError('Error performing search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Documents</h1>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block mb-2">Search Query:</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your search query..."
              />
            </div>
            
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <p className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</p>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Results:</h2>
            {results.map((result, index) => (
              <div key={index} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">
                      {result.filename} - Page {result.pageNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    Similarity: {(result.similarity * 100).toFixed(2)}%
                  </div>
                </div>
                <p className="text-gray-700">{result.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-500 hover:underline"
          >
            Back to Upload
          </Link>
        </div>
      </div>
    </main>
  );
} 