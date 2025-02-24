import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { pdfToPages } from "pdf-ts";

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pages = await pdfToPages(buffer);

    // Process each page
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

    return NextResponse.json({ message: "PDF processed successfully" });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json({ error: "Error processing PDF" }, { status: 500 });
  }
}
