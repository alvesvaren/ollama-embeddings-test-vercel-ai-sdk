"use server";

import { db } from "@/lib/db";
import { documents, resources } from "@/lib/db/schema";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import fs from "fs/promises";
import { redirect } from "next/navigation";
import ollama from "ollama";
import { parse } from "partial-json";
import { pdfToPages } from "pdf-ts";
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

export async function search(query: string, documentId: string) {
  if (!query) {
    throw new Error("No query provided");
  }

  const embedding = await getEmbedding(query);

  // Calculate cosine similarity and find the most similar documents
  const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

  const results = await db
    .select({
      content: documents.content,
      pageNumber: documents.pageNumber,
      summary: documents.summary,
      similarity,
      resourceId: documents.resourceId,
      filename: resources.filename,
    })
    .from(documents)
    .leftJoin(resources, eq(documents.resourceId, resources.uuid))
    .where(and(gt(similarity, 0.1), eq(documents.resourceId, documentId)))
    .orderBy(desc(similarity))
    .limit(10);

  return { results };
}

async function summarize(text: string) {
  const outputSchema = z.object({
    chapter: z.number().int().describe("The chapter number of the current page. Use -1 if unsure."),
    section: z.number().int().describe("The section number of the current page. Use -1 if unsure."),
    type: z
      .enum(["unknown", "example", "explaination", "other", "none", "theory", "exercise", "summary"])
      .describe("The type of the current page. Use 'unknown' if unsure. If there's multiple types, use the most relevant one."),
    contentDescription: z
      .string()
      .describe(
        "En kort beskrivning av innehållet, som mest 100 ord. Exempel: 'Matrismultiplikation är en metod för att multiplicera två matriser tillsammans. Skalärprodukten är en metod för att multiplicera två vektorer tillsammans.'. Svara alltid på svenska."
      ),
  });

  const response = await ollama.chat({
    model: "phi4",
    options: {
      num_predict: 256,
      temperature: 0.2,
    },
    messages: [
      {
        role: "system",
        content: "Based on the content, provide the requested data. Always write the summary in Swedish.",
      },
      {
        role: "user",
        content: text,
      },
    ],
    format: zodToJsonSchema(outputSchema),
  });

  return outputSchema.parse(parse(response.message.content));
}

export async function upload(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const [resource] = await db
    .insert(resources)
    .values({
      filename: file.name,
    })
    .returning();

  await fs.writeFile(`./public/uploads/${resource.uuid}.pdf`, await file.bytes());

  const buffer = Buffer.from(await file.arrayBuffer());
  const pages = await pdfToPages(buffer);

  for (const [index, page] of pages.entries()) {
    console.log(`Summarizing page ${page.page} (${index + 1}/${pages.length})`);
    const pageSummary = await summarize(page.text).catch(e => {
      console.error("Error summarizing page", e);
      return null;
    });

    if (!pageSummary) continue;

    const embedding = await getEmbedding(pageSummary.contentDescription);

    if (embedding.length === 0) continue;

    await db.insert(documents).values({
      resourceId: resource.uuid,
      content: page.text,
      pageNumber: page.page,
      embedding: embedding,
      summary: pageSummary.contentDescription,
      chapter: pageSummary.chapter,
      section: pageSummary.section,
      type: pageSummary.type,
    });
  }

  return redirect(`/search/${resource.uuid}`);
}
