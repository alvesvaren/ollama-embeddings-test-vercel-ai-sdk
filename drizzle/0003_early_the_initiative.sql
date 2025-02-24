CREATE TABLE "resources" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "embedding" TO "contentEmbedding";--> statement-breakpoint
DROP INDEX "embeddingIndex";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "chapter" integer DEFAULT -1;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "section" integer DEFAULT -1;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "type" text DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "summaryEmbedding" vector(1024);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "resourceId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_resourceId_resources_uuid_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("uuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contentEmbeddingIndex" ON "documents" USING hnsw ("contentEmbedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "summaryEmbeddingIndex" ON "documents" USING hnsw ("summaryEmbedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "filename";