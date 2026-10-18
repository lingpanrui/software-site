const { PrismaClient } = require('@prisma/client');
const { SHA256 } = require('crypto-js');

const prisma = new PrismaClient();
const salt = 'softwaresite_salt_2024';
const hash = SHA256('useradmin' + salt).toString();

async function main() {
  const user = await prisma.appUser.update({
    where: { username: 'lingpanrui' },
    data: {
      username: 'user@admin',
      passwordHash: hash,
    },
  });
  console.log('已更新管理员账号:', user.username);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
