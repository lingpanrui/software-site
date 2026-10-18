/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const CryptoJS = require('crypto-js');

const DB_URL = 'postgresql://postgres:kGLwMxEqTGtHpDBMFhhUwhtzQrmHpDQN@127.0.0.1:54330/railway';
const SALT = process.env.PASSWORD_SALT || 'softwaresite_salt_2024';
const ADMIN_USERNAME = 'user@admin';
const ADMIN_PASSWORD = 'useradmin';

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: DB_URL } } });
  try {
    const hash = CryptoJS.SHA256(ADMIN_PASSWORD + SALT).toString();
    console.log('哈希:', hash);
    console.log('SALT:', SALT);

    // 直接用 SQL 插入（让数据库生成 uuid），on conflict 处理
    const result = await p.$executeRawUnsafe(
      `INSERT INTO app_users (id, username, "passwordHash", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'admin', NOW(), NOW())
       ON CONFLICT (username) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = 'admin', "updatedAt" = NOW()
       RETURNING id, username, role`,
      ADMIN_USERNAME,
      hash,
    );
    console.log('插入完成, affected rows =', result);

    // 验证
    const rows = await p.$queryRawUnsafe(
      'SELECT id, username, role, "passwordHash" FROM app_users WHERE username = $1',
      ADMIN_USERNAME,
    );
    console.log('验证查询结果:', JSON.stringify(rows, null, 1));
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
