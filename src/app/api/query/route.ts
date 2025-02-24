import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { documents } from '@/lib/db/schema';

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('http://localhost:11434/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'bge-m3',
      prompt: text,
    }),
  });

  const data = await response.json();
  return data.embedding;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 });
    }

    const embedding = await getEmbedding(query);
    
    // Calculate cosine similarity and find the most similar documents
    const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

    const results = await db
      .select({
        content: documents.content,
        filename: documents.filename,
        pageNumber: documents.pageNumber,
        similarity
      })
      .from(documents)
      .where(gt(similarity, 0.1))
      .orderBy(desc(similarity))
      .limit(10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error querying documents:', error);
    return NextResponse.json(
      { error: 'Error querying documents' },
      { status: 500 }
    );
  }
} 