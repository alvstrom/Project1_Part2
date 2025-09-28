# Project1_Part2

A collaborative whiteboard app with Node.js, Express, Prisma, and PostgreSQL.

## Start

1. **Clone the repo**

   ```sh
   git clone https://github.com/alvstrom/Project1_Part2.git
   cd Project1_Part2
   ```

2. **Set up environment variables**

   Edit `.env` with your `DATABASE_URL` and `JWT_SECRET`.

3. **Install dependencies**

   ```sh
   npm install
   ```

4. **Prisma setup**

   ```sh
   npx prisma generate
   npx prisma db push
   ```

5. **Start the server**
   ```sh
   node index.js
   ```

## Docker

To run with Docker Compose:

```sh
docker compose up --build
```

## API

- REST endpoints for boards and post-its.
- JWT authentication required.

---

````# Project1_Part2

A collaborative whiteboard app with Node.js, Express, Prisma, and PostgreSQL.

## Quick Start

1. **Clone the repo**
   ```sh
   git clone https://github.com/alvstrom/Project1_Part2.git
   cd Project1_Part2
````

2. **Set up environment variables**

   Edit `.env` with your `DATABASE_URL` and `JWT_SECRET`.

3. **Install dependencies**

   ```sh
   npm install
   ```

4. **Prisma setup**

   ```sh
   npx prisma generate
   npx prisma db push
   ```

5. **Start the server**
   ```sh
   node index.js
   ```

## Docker

To run with Docker Compose:

```sh
docker compose up --build
```

## API

- REST endpoints for boards and post-its.
- JWT authentication required.

---
