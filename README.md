# Project 1 Part 2

REST API for whiteboard application with post-its and boards.
REST client i used for testing: Insomnia

## Setup

```bash
npm install
# Add .env file with JWT_SECRET and DATABASE_URL
npx prisma db push
npm run dev
```

Server runs on `http://localhost:3002`

## API Endpoints

All endpoints require JWT authentication except `/api/wake-db`.

**Authentication:**

```
Authorization: Bearer <your-jwt-token>
```

**Boards:**

- `GET/POST/PATCH/DELETE /api/boards`

**Post-its:**

- `GET/POST/PATCH/DELETE /api/postits`

**Test:**

- `GET /api/wake-db` - Test database connection

## Technologies

Express.js, Prisma, PostgreSQL (Supabase), JWT, Zod

## Features

- JWT Authentication & user data isolation
- Input validation with proper error handling
- CRUD operations with cascade delete
- RESTful API design
