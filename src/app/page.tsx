'use client';

import Link from "next/link";
import { upload } from "./actions";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PDF Vector Search</h1>
        
        <div className="mb-8">
          <form action={upload} className="space-y-4">
            <div>
              <label className="block mb-2">Upload PDF:</label>
              <input
                type="file"
                name="file"
                accept=".pdf"
                className="block w-full"
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              Upload and Process
            </button>
          </form>
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
