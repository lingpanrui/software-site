/* eslint-disable @typescript-eslint/no-var-requires */
// 临时脚本：通过隧道连接 Railway Postgres，检查/创建管理员账号
const { PrismaClient } = require('@prisma/client');
const CryptoJS = require('crypto-js');

const SALT = process.env.PASSWORD_SALT || 'softwaresite_salt_2024';
const ADMIN_USERNAME = 'user@admin';
const ADMIN_PASSWORD = 'useradmin';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://postgres:kGLwMxEqTGtHpDBMFhhUwhtzQrmHpDQN@127.0.0.1:54330/railway' },
    },
  });
  try {
    // 1. 查看现有用户
    const users = await prisma.appUser.findMany();
    console.log('=== app_users 表内容 ===');
    if (users.length === 0) {
      console.log('(空表)');
    } else {
      for (const u of users) {
        console.log(`id=${u.id} username=${u.username} role=${u.role} hash=${u.passwordHash.slice(0, 16)}...`);
      }
    }

    // 2. 检查管理员是否存在
    const existing = await prisma.appUser.findUnique({ where: { username: ADMIN_USERNAME } });
    if (existing) {
      console.log(`\n管理员 ${ADMIN_USERNAME} 已存在`);
      const expectedHash = CryptoJS.SHA256(ADMIN_PASSWORD + SALT).toString();
      console.log(`现有哈希: ${existing.passwordHash}`);
      console.log(`期望哈希: ${expectedHash}`);
      console.log(existing.passwordHash === expectedHash ? '哈希一致 ✅' : '哈希不一致 ❌');
    } else {
      console.log(`\n管理员 ${ADMIN_USERNAME} 不存在，需要创建`);
      const hash = CryptoJS.SHA256(ADMIN_PASSWORD + SALT).toString();
      const created = await prisma.appUser.create({
        data: { username: ADMIN_USERNAME, passwordHash: hash, role: 'admin' },
      });
      console.log(`已创建: id=${created.id} username=${created.username} role=${created.role}`);
    }
  } catch (e) {
    console.error('执行失败:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
