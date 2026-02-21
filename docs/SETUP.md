# Local Development Setup

## Database (MySQL + Prisma)

FleetFlow uses **MySQL 8** with **Prisma** as the ORM.

- **Docker**: `docker-compose up` starts MySQL on port `3306`.
- **Connection string**: `mysql://fleetflow:fleetflow@localhost:3306/fleetflow`
- **Prisma**: Run `npx prisma generate` and `npx prisma migrate dev` from the project root (or `database/` folder).

