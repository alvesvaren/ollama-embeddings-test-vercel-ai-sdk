'use client';

import Link from "next/link";
import { useState } from "react";
import type { search } from "../actions";

type SearchUIProps = {
  query?: string;
  results: Awaited<ReturnType<typeof search>>["results"];
};

export default function SearchUI({ query, results }: SearchUIProps) {
  const [selectedPdf, setSelectedPdf] = useState<{ filename: string; pageNumber: number } | null>(null);

  return (
    <main className='min-h-screen p-8'>
      <div className='flex gap-8'>
        {/* Left column - Search and Results */}
        <div className='w-1/2'>
          <h1 className='text-3xl font-bold mb-8'>Search Documents</h1>

          <div className='mb-8'>
            <form className='space-y-4'>
              <div>
                <label className='block mb-2'>Search Query:</label>
                <input 
                  type='text' 
                  name='query' 
                  defaultValue={query} 
                  className='w-full p-2 border rounded' 
                  placeholder='Enter your search query...' 
                />
              </div>

              <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400'>
                Search
              </button>
            </form>
          </div>

          {results.length > 0 && (
            <div className='space-y-6'>
              <h2 className='text-xl font-semibold'>Results:</h2>
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className='p-4 border rounded cursor-pointer hover:bg-gray-50'
                  onClick={() => setSelectedPdf({ filename: result.filename, pageNumber: result.pageNumber })}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div className='font-medium'>
                      {result.filename} - Page {result.pageNumber}
                    </div>
                    <div className='text-sm text-gray-500'>Similarity: {(result.similarity * 100).toFixed(2)}%</div>
                  </div>
                  <p className='text-gray-700'>{result.summary}</p>
                </div>
              ))}
            </div>
          )}

          <div className='mt-8'>
            <Link href='/' className='text-blue-500 hover:underline'>
              Back to Upload
            </Link>
          </div>
        </div>

        {/* Right column - PDF Viewer */}
        <div className='w-1/2 h-screen sticky top-0'>
          <div className='w-full h-full border rounded-lg overflow-hidden'>
            {selectedPdf ? (
              <iframe 
                src={`/uploads/${selectedPdf.filename}#page=${selectedPdf.pageNumber}`}
                className='w-full h-full'
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center text-gray-500'>
                Click a search result to view the PDF
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 