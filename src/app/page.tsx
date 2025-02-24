'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('PDF uploaded and processed successfully!');
        setFile(null);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Vector Search</h1>
        
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Upload PDF:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full"
              />
            </div>
            
            <button
              type="submit"
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Upload and Process'}
            </button>
          </form>

          {message && (
            <p className="mt-4 p-4 bg-gray-100 rounded">{message}</p>
          )}
        </div>

        <div>
          <Link
            href="/search"
            className="text-blue-500 hover:underline"
          >
            Go to Search Page
          </Link>
        </div>
      </div>
    </main>
  );
}
