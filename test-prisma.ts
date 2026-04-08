import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const p = new PrismaClient({
  adapter: new PrismaNeon(process.env.DATABASE_URL! as any),
});
p.$connect()
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
