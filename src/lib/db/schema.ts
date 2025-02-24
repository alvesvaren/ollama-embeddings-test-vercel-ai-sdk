import { pgTable, text, timestamp, serial, integer, vector, index } from "drizzle-orm/pg-core";

export const documents = pgTable(
  "documents",
  {
    id: serial().primaryKey(),
    content: text().notNull(),
    pageNumber: integer().notNull(),
    filename: text().notNull(),
    summary: text(),
    chapter: integer().default(-1),
    section: integer().default(-1),
    type: text().default("unknown"),
    embedding: vector({ dimensions: 1024 }),
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ]
);
