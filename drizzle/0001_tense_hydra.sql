CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"pageNumber" integer NOT NULL,
	"filename" text NOT NULL,
	"embedding" vector(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
