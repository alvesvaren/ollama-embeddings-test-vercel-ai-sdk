import fs from "fs/promises";
import { db } from ".";
import { documents, resources } from "./schema";

export async function clear() {
  await fs.rm("./public/uploads", { recursive: true, force: true });
  await fs.mkdir("./public/uploads");
  await fs.writeFile("./public/uploads/.gitkeep", "");

  await db.delete(documents);
  await db.delete(resources);
  console.log("Database cleared");
  process.exit(0);
}

clear();
