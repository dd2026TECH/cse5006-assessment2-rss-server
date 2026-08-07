# API container — follows the Module 7 lab's Dockerfile structure.
FROM node:lts

WORKDIR /app

# Dependencies first, so a source-only change does not reinstall them.
COPY package*.json ./
RUN npm install

# Prisma schema is copied before the rest so `prisma generate` can run at build
# time — the generated client is gitignored and must be produced in the image.
COPY prisma ./prisma
COPY prisma.config.ts ./

COPY . .

# wait-for-it.sh blocks until Postgres is accepting connections. depends_on
# only waits for the container to start, not for the database to be ready.
# chmod must run after COPY . . — git stores this file as non-executable
# (mode 644), so an earlier chmod gets silently overwritten when COPY . .
# re-copies it from the build context. Windows Docker Desktop's looser
# permission handling hid this; a native Linux build (EC2) does not.
COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN npx prisma generate

EXPOSE 3000

CMD ["/bin/sh", "/app/entrypoint.sh"]
