import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

// One client per process. Next.js hot-reloads modules in development, which
// would otherwise open a new connection pool on every edit until Postgres
// refuses them — so the instance is parked on globalThis and reused.
//
// Prisma 7 requires a driver adapter rather than a bundled query engine, so the
// connection is handed to PrismaPg explicitly. DATABASE_URL comes from .env
// locally and from docker-compose (pointing at the `postgres` service) in
// containers.
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env for local development, " +
        "or check the api service environment in docker-compose.yml.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
