import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'vectordb',
});

const db = drizzle(pool);

async function main() {
  console.log('Migration started...');
  
  // First enable the vector extension
  await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
  
  // Then run the migrations
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('Migration completed!');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
}); 