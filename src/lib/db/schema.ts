import { pgTable, text, timestamp, integer, vector, index, uuid, serial } from "drizzle-orm/pg-core";

export const resources = pgTable("resources", {
  uuid: uuid().primaryKey().defaultRandom(),
  filename: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const documents = pgTable(
  "documents",
  {
    id: serial().primaryKey(),
    content: text().notNull(),
    pageNumber: integer().notNull(),
    summary: text(),
    chapter: integer().default(-1),
    section: integer().default(-1),
    type: text().default("unknown"),
    contentEmbedding: vector({ dimensions: 1024 }),
    summaryEmbedding: vector({ dimensions: 1024 }),
    createdAt: timestamp().defaultNow().notNull(),
    resourceId: uuid()
      .references(() => resources.uuid)
      .notNull(),
  },
  table => [
    index("contentEmbeddingIndex").using("hnsw", table.contentEmbedding.op("vector_cosine_ops")),
    index("summaryEmbeddingIndex").using("hnsw", table.summaryEmbedding.op("vector_cosine_ops"))
  ]
);
