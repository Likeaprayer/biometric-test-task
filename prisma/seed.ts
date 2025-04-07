// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create two dummy articles
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@gmail.com',
      biometricKey: crypto.randomUUID(),
      password: '$2a$12$DqLh0Brz4tIvC0fGIJos.O5vtvq5aSzVlnsUQQjQbI.HAz0gPpQTe',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@gmail.com',
      biometricKey: crypto.randomUUID(),
      password: '$2a$12$DqLh0Brz4tIvC0fGIJos.O5vtvq5aSzVlnsUQQjQbI.HAz0gPpQTe',
    },
  });

  console.log({ user1, user2 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
