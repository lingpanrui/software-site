/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

const DB_URL = 'postgresql://postgres:kGLwMxEqTGtHpDBMFhhUwhtzQrmHpDQN@127.0.0.1:54330/railway';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: DB_URL } } });
  try {
    for (const tbl of ['app_users', 'software', 'site_settings']) {
      const cols = await p.$queryRawUnsafe(
        `SELECT column_name, data_type, column_default, is_nullable
         FROM information_schema.columns
         WHERE table_name = $1
         ORDER BY ordinal_position`,
        tbl,
      );
      console.log(`=== ${tbl} ===`);
      for (const c of cols) console.log(`${c.column_name} | ${c.data_type} | default=${c.column_default} | null=${c.is_nullable}`);
      const cnt = await p.$queryRawUnsafe(`SELECT COUNT(*)::int AS n FROM "${tbl}"`);
      console.log(`行数: ${cnt[0].n}`);
    }
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
