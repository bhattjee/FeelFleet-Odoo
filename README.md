# FleetFlow

FleetFlow is a monolithic Fleet & Logistics management system.

## Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL (Dockerized)

## Quick Start
1. `docker-compose up`
2. Backend is on `4000`, Frontend on `5173`.

## Manual Setup (Backend)
1. `cd backend`
2. `npm install`
3. `npx prisma generate --schema=../database/prisma/schema.prisma`
4. `npm run dev`

## Seeding
`npx tsx database/seeds/seed.ts`
