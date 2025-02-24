"use server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { pdfToPages } from "pdf-ts";
import fs from "fs/promises";
import ollama from "ollama";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

async function getEmbedding(text: string): Promise<number[]> {
  const {
    embeddings: [embedding],
  } = await ollama.embed({
    input: text,
    model: "bge-m3",
  });

  return embedding;
}

export async function search(query: string) {
  try {
    if (!query) {
      throw new Error("No query provided");
    }

    const embedding = await getEmbedding(query);

    // Calculate cosine similarity and find the most similar documents
    const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

    const results = await db
      .select({
        content: documents.content,
        filename: documents.filename,
        pageNumber: documents.pageNumber,
        summary: documents.summary,
        similarity,
      })
      .from(documents)
      .where(gt(similarity, 0.1))
      .orderBy(desc(similarity))
      .limit(10);

    return { results };
  } catch (error) {
    console.error("Error querying documents:", error);
    throw error;
  }
}

async function summarize(text: string) {
  const outputSchema = z.object({
    summary: z
      .string()
      .describe(
        "A short description of the current page. Keep it short and to the point, but make sure to include all important information. Example: 'Matrix multiplication is a way to multiply two matrices together. Dot product is a way to multiply two vectors together.'. Keep it in the same language as the current page."
      ),
    chapter: z.number().int().describe("The chapter number of the current page. Use -1 if unsure."),
    section: z.number().int().describe("The section number of the current page. Use -1 if unsure."),
    type: z
      .enum(["unknown", "example", "explaination", "other", "none", "theory", "exercise", "summary"])
      .describe("The type of the current page. Use 'unknown' if unsure. If there's multiple types, use the most relevant one."),
  });

  const response = await ollama.chat({
    model: "phi4",
    messages: [
      {
        role: "system",
        content: "Based on the content, provide the requested data.",
      },
      {
        role: "user",
        content: `Current page: ${text}`,
      },
    ],
    format: zodToJsonSchema(outputSchema),
  });

  return outputSchema.parse(JSON.parse(response.message.content));
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

    for (const [index, page] of pages.entries()) {
      console.log(`Summarizing page ${page.page} (${index + 1}/${pages.length})`);
      const pageSummary = await summarize(page.text).catch(e => {
        console.error("Error summarizing page", e);
        return null;
      });

      if (!pageSummary) continue;

      const embedding = await getEmbedding(pageSummary.summary);

      if (embedding.length === 0) continue;

      await db.insert(documents).values({
        content: page.text,
        pageNumber: page.page,
        filename: file.name,
        embedding: embedding,
        summary: pageSummary.summary,
        chapter: pageSummary.chapter,
        section: pageSummary.section,
        type: pageSummary.type,
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
