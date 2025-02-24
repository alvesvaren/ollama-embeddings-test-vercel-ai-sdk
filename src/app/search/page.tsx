import Link from "next/link";
import { search } from "../actions";

export default async function Search({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams;

  console.log(query);

  const { results = [] } = query ? await search(query) : { results: [] };

  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Search Documents</h1>

        <div className='mb-8'>
          <form className='space-y-4'>
            <div>
              <label className='block mb-2'>Search Query:</label>
              <input type='text' name='query' defaultValue={query} className='w-full p-2 border rounded' placeholder='Enter your search query...' />
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
              <div key={index} className='p-4 border rounded'>
                <div className='flex justify-between items-start mb-2'>
                  <div className='font-medium'>
                    {result.filename} - Page {result.pageNumber}
                  </div>
                  <div className='text-sm text-gray-500'>Similarity: {(result.similarity * 100).toFixed(2)}%</div>
                </div>
                <p className='text-gray-700'>{result.content}</p>
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
    </main>
  );
}
