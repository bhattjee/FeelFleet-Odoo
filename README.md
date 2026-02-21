# FeelFleet – Fleet & Logistics Management

A full-stack fleet management system for vehicles, trips, drivers, maintenance, and analytics with role-based access (Manager, Dispatcher, Safety Officer, Financial Analyst).

# Tech Stack

| Layer    | Technologies                                                                          |
| -------- | ------------------------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite 7, React Router 6, Recharts, Zustand, React Hook Form, Zod |
| Backend  | Node.js, Express 4, TypeScript, TSX (dev)                                             |
| Database | PostgreSQL 15, Prisma 6 (ORM + migrations)                                            |
| Auth     | JWT (httpOnly cookies), bcrypt, role-based access control (RBAC)                      |
| DevOps   | Docker & Docker Compose (Postgres, pgAdmin, backend, frontend)                        |
| Tooling  | ESLint, Prettier, Pino (logging), Helmet, express-rate-limit                          |

# Repository Structure

FeelFleet-Odoo/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/          # env, database, cors, logger
│   │   ├── middleware/      # auth, RBAC, validation, rate-limit, errorHandler
│   │   ├── modules/         # feature modules
│   │   │   ├── auth/        # login, register, /me, logout
│   │   │   ├── vehicles/    # CRUD, retire, available
│   │   │   ├── drivers/     # CRUD, duty status, available
│   │   │   ├── trips/       # create, status (dispatch/complete/cancel)
│   │   │   ├── maintenance/ # service logs, complete
│   │   │   ├── expenses/    # fuel log, vehicle total, list
│   │   │   └── analytics/   # KPIs, fuel-efficiency, financial-summary
│   │   ├── events/          # eventEmitter, trip/vehicle events
│   │   ├── jobs/            # scheduler, license-expiry checker
│   │   ├── utils/           # apiResponse, pdf, dateHelpers, pagination
│   │   ├── types/           # enums, global.d.ts
│   │   ├── scripts/         # seed_indian_data, verify_* scripts
│   │   ├── app.ts           # Express app (routes, middleware)
│   │   └── server.ts        # start server, graceful shutdown
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React SPA
│   ├── src/
│   │   ├── api/             # client, auth, vehicles, drivers, trips, maintenance
│   │   ├── assets/icons/    # Dashboard, Truck, Route, Wrench, etc.
│   │   ├── components/
│   │   │   ├── dashboard/   # KPICard, modals, FleetFilterBar
│   │   │   ├── layout/      # AppLayout, Sidebar, TopBar, PageWrapper
│   │   │   └── ui/          # Button, Table, Modal, Input, Badge, etc.
│   │   ├── constants/       # roles, routes
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Dashboard, VehicleRegistry, etc.
│   │   ├── router/          # AppRouter, ProtectedRoute, RoleRoute
│   │   ├── stores/          # layoutStore (Zustand)
│   │   ├── styles/          # globals, variables, typography
│   │   ├── utils/           # formatRole
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── database/
│   ├── prisma/
│   │   ├── schema.prisma    # User, Vehicle, Driver, Trip, etc.
│   │   └── migrations/
│   ├── seeds/               # seed.ts
│   └── schema/              # erd.md
├── docs/                    # API.md, SETUP.md, RBAC.md
├── docker-compose.yml       # db, pgAdmin, backend, frontend
├── .gitignore
└── README.md

# Quick Start
Docker (Recommended)
Start all services
docker-compose up

Frontend: http://localhost:5173
Backend API: http://localhost:4000
pgAdmin: http://localhost:5050 (admin@fleetflow.com / admin)

Local Setup (Without Docker)
Prerequisites: Node 18+, PostgreSQL 15, npm.

# Database
Create a DB (e.g. feelfleet).
Set DATABASE_URL in backend/.env (see backend/.env.example).

# Backend
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
API: http://localhost:4000

# Frontend
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:4000
npm run dev
App: http://localhost:5173

Seed Logins:
admin@feelfleet.in / password123 (Manager)
prakash@feelfleet.in / password123 (Dispatcher)​

## Screenshots

| Screen                                                                                              | Description                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| <img src="docs/screenshots/Login.png" width="280" height="160" alt="Login">                         | User login interface                        |
| <img src="docs/screenshots/Signup.png" width="280" height="160" alt="Signup">                       | User registration form                      |
| <img src="docs/screenshots/Signup Filled.png" width="280" height="160" alt="Signup Filled">         | Completed signup form                       |
| <img src="docs/screenshots/Sidebar.png" width="280" height="160" alt="Sidebar">                     | Application navigation sidebar              |
| <img src="docs/screenshots/Dashboard.png" width="280" height="160" alt="Dashboard">                 | Main dashboard – KPIs, filters, trips table |
| <img src="docs/screenshots/Vehical Registory.png" width="280" height="160" alt="Vehicle Registry">  | Vehicle list and registration               |
| <img src="docs/screenshots/Vehical Log Button.png" width="280" height="160" alt="Vehicle Log">      | Vehicle log entry button                    |
| <img src="docs/screenshots/Trips.png" width="280" height="160" alt="Trips">                         | Trip management interface                   |
| <img src="docs/screenshots/Service.png" width="280" height="160" alt="Service">                     | Maintenance service overview                |
| <img src="docs/screenshots/Service Log Button.png" width="280" height="160" alt="Service Log">      | Service log entry button                    |
| <img src="docs/screenshots/Expense and Fuel.png" width="280" height="160" alt="Expense & Fuel">     | Combined expense and fuel tracking          |
| <img src="docs/screenshots/Fuel Log Buttons.png" width="280" height="160" alt="Fuel Logs">          | Fuel logging interface                      |
| <img src="docs/screenshots/Deivers '&' Safety.png" width="280" height="160" alt="Drivers & Safety"> | Drivers and safety management               |
| <img src="docs/screenshots/Analytics.png" width="280" height="160" alt="Analytics">                 | Analytics dashboard and KPIs                |

Short description: login, dashboard, vehicle, trip, maintenance, and analytics.

Explnation video link: https://files.catbox.moe/nddf0a.mp4

<video src="docs/demo.mp4" controls width="640"></videos

# Features

Auth & RBAC: Login/register, JWT in httpOnly cookie, roles: Manager, Dispatcher, Safety Officer, Financial Analyst.
Dashboard: Active fleet, maintenance alerts, utilization rate, pending cargo, trips table with filters.
Vehicle Registry: Add/edit, retire (out of service), filter by type/region.
Trip Dispatcher: Create trip (capacity + license checks), dispatch → complete/cancel, vehicle/driver status.
Maintenance: Service logs, vehicle → In Shop, complete → Available.
Expenses & Fuel: Log fuel, vehicle total cost (fuel + maintenance).
Analytics: KPIs, fuel efficiency, financial summary, costly vehicles.
Driver Profiles: License expiry, duty status, completion rate.

# API Overview
GET/POST /api/auth/* – login, register, logout, me
GET/POST/PATCH /api/vehicles/* – list, create, update, retire, available
GET/POST/PATCH /api/drivers/* – list, create, update, duty status, available
GET/POST/PATCH /api/trips/* – list, create, update status
GET/POST/PATCH /api/maintenance/* – logs, create, complete
GET/POST /api/expenses/* – list, create, fuel, vehicle total
GET /api/analytics/* – kpis, fuel-efficiency, financial-summary, costly-vehicles

# Details: see docs/API.md.​

# License
MIT License.
​
