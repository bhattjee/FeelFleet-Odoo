# FeelFleet – Fleet & Logistics Management

A full-stack fleet management system for vehicles, trips, drivers, maintenance, and analytics with role-based access (Manager, Dispatcher, Safety Officer, Financial Analyst).

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite 7, React Router 6, Recharts, Zustand, React Hook Form, Zod |
| **Backend** | Node.js, Express 4, TypeScript, TSX (dev) |
| **Database** | PostgreSQL 15, Prisma 6 (ORM + migrations) |
| **Auth** | JWT (httpOnly cookies), bcrypt, role-based access control (RBAC) |
| **DevOps** | Docker & Docker Compose (Postgres, pgAdmin, backend, frontend) |
| **Tooling** | ESLint, Prettier, Pino (logging), Helmet, express-rate-limit |

---

## Repository Structure

FeelFleet-Odoo/
├── backend/ # Express API
│ ├── src/
│ │ ├── config/ # env, database, cors, logger
│ │ ├── middleware/ # auth, RBAC, validation, rate-limit, errorHandler
│ │ ├── modules/ # feature modules
│ │ │ ├── auth/ # login, register, /me, logout
│ │ │ ├── vehicles/ # CRUD, retire, available
│ │ │ ├── drivers/ # CRUD, duty status, available
│ │ │ ├── trips/ # create, status (dispatch/complete/cancel)
│ │ │ ├── maintenance/ # service logs, complete
│ │ │ ├── expenses/ # fuel log, vehicle total, list
│ │ │ └── analytics/ # KPIs, fuel-efficiency, financial-summary
│ │ ├── events/ # eventEmitter, trip/vehicle events
│ │ ├── jobs/ # scheduler, license-expiry checker
│ │ ├── utils/ # apiResponse, pdf, dateHelpers, pagination
│ │ ├── types/ # enums, global.d.ts
│ │ ├── scripts/ # seed_indian_data, verify_* scripts
│ │ ├── app.ts # Express app (routes, middleware)
│ │ └── server.ts # start server, graceful shutdown
│ ├── package.json
│ └── tsconfig.json
│
├── frontend/ # React SPA
│ ├── src/
│ │ ├── api/ # client, auth, vehicles, drivers, trips, maintenance
│ │ ├── assets/icons/ # Dashboard, Truck, Route, Wrench, etc.
│ │ ├── components/
│ │ │ ├── dashboard/ # KPICard, modals (Trip, Vehicle, Driver, Fuel, Service, Expense), FleetFilterBar
│ │ │ ├── layout/ # AppLayout, Sidebar, TopBar, PageWrapper
│ │ │ └── ui/ # Button, Table, Modal, Input, Badge, Alert, Spinner, Select, Tooltip, EmptyState
│ │ ├── constants/ # roles, routes
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Dashboard, VehicleRegistry, TripDispatcher, Maintenance, Expense, Analytics, DriverProfile, Auth (Login/Register)
│ │ ├── router/ # AppRouter, ProtectedRoute, RoleRoute
│ │ ├── stores/ # layoutStore (Zustand)
│ │ ├── styles/ # globals, variables, typography, animations
│ │ ├── utils/ # formatRole
│ │ ├── App.tsx
│ │ └── main.tsx
│ ├── index.html
│ ├── package.json
│ ├── vite.config.ts
│ └── tsconfig.json
│
├── database/
│ ├── prisma/
│ │ ├── schema.prisma # User, Vehicle, Driver, Trip, MaintenanceLog, Expense
│ │ └── migrations/
│ ├── seeds/ # seed.ts (alternate seed)
│ └── schema/ # erd.md
│
├── docs/ # API.md, SETUP.md, RBAC.md, WORKFLOW.md, CALCULATIONS.md
├── docker-compose.yml # db (Postgres), pgAdmin, backend, frontend
├── .gitignore
└── README.md

---

## Quick Start

### Docker

1. **Start all services**
   ```sh
   docker-compose up

Open:

Frontend: http://localhost:5173
Backend API: http://localhost:4000
pgAdmin: http://localhost:5050 (admin@fleetflow.com / admin)

Local Setup (without Docker)
Prerequisites: Node 18+, PostgreSQL 15, npm.

Database
Create a DB (e.g. fleetflow) and set DATABASE_URL in backend/.env (see backend/.env.example).

Database
Create a DB (e.g. fleetflow) and set DATABASE_URL in backend/.env (see backend/.env.example).

Backend

cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
API: http://localhost:4000

Frontend

cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:4000
npm run dev
App: http://localhost:5173

Seed logins:
admin@feelfleet.in / password123 (Manager)
prakash@feelfleet.in / password123 (Dispatcher)

Video Walkthrough
https://docs/screenshots/thumbnail.png

Click the thumbnail above to watch the demo video

Video highlights:

Login flow
Dashboard overview
Vehicle management
Trip dispatch
Maintenance tracking
Analytics view

<video src="docs/demo.mp4" controls width="640"></video>

Features

Auth & RBAC: Login/register, JWT in httpOnly cookie, roles: Manager, Dispatcher, Safety Officer, Financial Analyst
Dashboard: Active fleet, maintenance alerts, utilization rate, pending cargo, trips table with filters
Vehicle registry: Add/edit, retire (out of service), filter by type/region
Trip dispatcher: Create trip (capacity + license checks), dispatch → complete/cancel, vehicle/driver status
Maintenance: Service logs, vehicle → In Shop, complete → Available
Expenses & fuel: Log fuel, vehicle total cost (fuel + maintenance)
Analytics: KPIs, fuel efficiency, financial summary, costly vehicles
Driver profiles: License expiry, duty status, completion rate

API Overview

Method	Endpoint	Description

GET/POST	/api/auth/*	login, register, logout, me
GET/POST/PATCH	/api/vehicles/*	list, create, update, retire, available
GET/POST/PATCH	/api/drivers/*	list, create, update, duty status, available
GET/POST/PATCH	/api/trips/*	list, create, update status
GET/POST/PATCH	/api/maintenance/*	logs, create, complete
GET/POST	/api/expenses/*	list, create, fuel, vehicle total
GET	/api/analytics/*	kpis, fuel-efficiency, financial-summary, costly-vehicles

Details: see docs/API.md

Adding Screenshots and Video

Screenshots

Create folder: docs/screenshots/
dashboard.png
vehicle-registry.png
trip-dispatcher.png
maintenance.png
thumbnail.png (for video thumbnail)

Video Options
[Watch demo](docs/demo.mp4)

html
<video src="docs/demo.mp4" controls width="640"></video>

License
MIT

Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

Support
For issues or questions:
Open an issue

Check existing documentation

This is ready to copy and paste directly into your GitHub repository's README.md file. Just make sure to:
1. Update the GitHub repository URL in the Support section
2. Add your actual screenshots to the docs/screenshots/ folder
3. Add your demo video to docs/demo.mp4 or update the YouTube link
