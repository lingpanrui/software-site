/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

const DB_URL = 'postgresql://postgres:kGLwMxEqTGtHpDBMFhhUwhtzQrmHpDQN@127.0.0.1:54330/railway';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: DB_URL } } });
  try {
    // 1. 查看 app_users 表结构
    const cols = await p.$queryRawUnsafe(
      `SELECT column_name, data_type, column_default, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'app_users'
       ORDER BY ordinal_position`,
    );
    console.log('=== app_users 列 ===');
    for (const c of cols) console.log(JSON.stringify(c));

    // 2. 表里所有行
    const rows = await p.$queryRawUnsafe('SELECT id, username, role, "passwordHash" FROM app_users LIMIT 20');
    console.log('=== 现有行 ===');
    for (const r of rows) console.log(JSON.stringify(r));

    // 3. 看看有哪些表
    const tables = await p.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`,
    );
    console.log('=== 所有表 ===');
    for (const t of tables) console.log(t.table_name);
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
