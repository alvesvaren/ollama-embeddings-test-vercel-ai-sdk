"use server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { pdfToPages } from "pdf-ts";
import fs from "fs/promises";

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "bge-m3",
      prompt: text,
    }),
  });

  const data = await response.json();
  return data.embedding;
}

export async function search(query: string) {
  try {
    if (!query) {
      return { error: "No query provided" };
    }

    const embedding = await getEmbedding(query);

    // Calculate cosine similarity and find the most similar documents
    const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

    const results = await db
      .select({
        content: documents.content,
        filename: documents.filename,
        pageNumber: documents.pageNumber,
        similarity,
      })
      .from(documents)
      .where(gt(similarity, 0.1))
      .orderBy(desc(similarity))
      .limit(10);

    return { results };
  } catch (error) {
    console.error("Error querying documents:", error);
    return { error: "Error querying documents" };
  }
}

export async function upload(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    await fs.writeFile(`./public/uploads/${encodeURIComponent(file.name)}`, await file.bytes());

    const buffer = Buffer.from(await file.arrayBuffer());
    const pages = await pdfToPages(buffer);

    const existingDocument = await db.query.documents.findFirst({
      where: eq(documents.filename, file.name),
    });

    if (existingDocument) {
      throw new Error("File already exists");
    }

    for (const page of pages) {
      const embedding = await getEmbedding(page.text);
      if (embedding.length === 0) continue;

      await db.insert(documents).values({
        content: page.text,
        pageNumber: page.page,
        filename: file.name,
        embedding: embedding,
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
