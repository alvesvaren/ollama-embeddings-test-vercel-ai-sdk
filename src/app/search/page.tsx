import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function SearchPage() {
  const items = await db.query.resources.findMany({
    orderBy: desc(resources.createdAt),
  });
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <Link key={item.uuid} href={`/search/${item.uuid}`}>
            {item.filename} ({item.createdAt.toLocaleTimeString()})
          </Link>
        ))}
      </div>
      {items.length === 0 && <div>No resources found</div>}
    </div>
  );
}
