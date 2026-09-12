// Windows fallback for initial setup when Prisma's native TLS engine is unavailable.
// Refuses to initialize a database that already contains public tables.
import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
const client = new Client({ connectionString: process.env.DATABASE_URL, enableChannelBinding: true });
try {
  await client.connect();
  await client.query('BEGIN');
  const existing = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  if (existing.rowCount) throw new Error('Database is not empty; use Prisma migrations instead.');
  const sql = await readFile(new URL('./migrations/202609120001_initial/migration.sql', import.meta.url), 'utf8');
  await client.query(sql);
  await client.query(`CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`);
  await client.query('INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count) VALUES ($1,$2,$3,now(),1)', [randomUUID(), createHash('sha256').update(sql).digest('hex'), '202609120001_initial']);
  await client.query('COMMIT');
  console.log('Initial schema applied and migration recorded.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Initialization failed:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
