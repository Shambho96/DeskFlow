# DeskFlow Backend Master Execution Plan

**Target Root Directory:** `D:\HRM\HRM-backend`  
**Architecture:** Modular Monolith + Service Layer Pattern  
**Core Technologies:** Python 3.11+, FastAPI, Strawberry GraphQL, Async SQLAlchemy 2.0, PostgreSQL, Alembic, JWT (HttpOnly Cookies), Pydantic v2  

---

## 📂 Project Structure

```
D:\HRM\HRM-backend\
├── alembic\                       # Database Migration Scripts
│   ├── versions\
│   └── env.py
├── app\
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entrypoint & GraphQL router mount
│   ├── config.py                  # Pydantic BaseSettings (DB URL, JWT Secret, CORS)
│   │
│   ├── core\                      # Security & Context Core
│   │   ├── security.py            # Password hashing & JWT sign/verify
│   │   ├── context.py             # UserContext data model
│   │   └── dependencies.py        # REST auth middleware dependencies
│   │
│   ├── db\                        # Database Connection & Models
│   │   ├── base.py                # SQLAlchemy Base declaration
│   │   ├── session.py             # Async engine & AsyncSession maker
│   │   └── seed.py                # Demo Data Seed Script (Grand Palace Hotel)
│   │
│   ├── models\                    # SQLAlchemy ORM Database Schemas
│   │   ├── client.py              # clients table (Parent Organization)
│   │   ├── outlet.py              # outlets table (Hotel Branches)
│   │   ├── user.py                # users table (Owners, Managers, Staff)
│   │   ├── mapping.py             # user_client_outlet_mapping table
│   │   ├── room.py                # rooms & room_types tables
│   │   ├── booking.py             # bookings & folios tables
│   │   └── audit.py               # audit_logs table
│   │
│   ├── services\                  # Pure Business Logic (Reusable by REST & GraphQL)
│   │   ├── auth_service.py        # Login validation & Staff access guard logic
│   │   ├── room_service.py        # Room availability & auto-assignment
│   │   ├── booking_service.py     # Booking creation & atomic room assignment
│   │   ├── export_service.py      # Operations Excel/CSV report generator
│   │   └── whatsapp_service.py    # WhatsApp ops messaging & staff task dispatching
│   │
│   ├── graphql\                   # Strawberry GraphQL Schema & Resolvers
│   │   ├── schema.py              # Combined Strawberry GraphQL Schema
│   │   ├── context.py             # GraphQLContext (Extracts UserContext from Cookie)
│   │   ├── types\                 # GraphQL Type Definitions
│   │   ├── queries\               # GraphQL Query Resolvers (Rooms, Bookings, Staff)
│   │   └── mutations\             # GraphQL Mutation Resolvers (Bookings, Tasks)
│   │
│   └── routers\                   # REST API Routers
│       ├── auth_router.py         # POST /auth/login, POST /auth/logout
│       ├── export_router.py       # GET /reports/operations-excel
│       └── public_router.py       # GET/POST /public/book (Guest Direct Booking)
│
├── tests\                         # Pytest test suite
├── alembic.ini                    # Alembic configuration
├── pyproject.toml                 # Dependencies & project metadata
├── .env.example                   # Environment variables template
└── README.md
```

---

## 📋 Implementation Phases

### **Phase 1: Project Scaffolding & Environment Setup**
1. Create `D:\HRM\HRM-backend` directory.
2. Initialize virtual environment (`python -m venv .venv`).
3. Create `pyproject.toml` and install core dependencies:
   * `fastapi`, `uvicorn[standard]`
   * `strawberry-graphql[fastapi]`
   * `sqlalchemy[asyncio]`, `asyncpg`, `alembic`
   * `pydantic`, `pydantic-settings`
   * `python-jose[cryptography]`, `passlib[bcrypt]`
   * `pandas`, `openpyxl` (For Excel export)
   * `httpx` (For WhatsApp API integrations)
4. Configure `app/config.py` with environment variables (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`).

---

### **Phase 2: Database Schemas, Alembic Migrations & Demo Seed Data**
1. Define SQLAlchemy Models:
   * **`clients`**: `id`, `name`, `code`, `is_active`
   * **`outlets`**: `id`, `client_id`, `name`, `city`, `phone`
   * **`users`**: `id`, `client_id`, `name`, `email`, `phone` (WhatsApp), `password_hash`, `role` (`OWNER`, `MANAGER`, `STAFF`), `can_login` (`BOOLEAN`)
   * **`user_client_outlet_mapping`**: `id`, `user_id`, `client_id`, `outlet_id`, `is_primary`
   * **`rooms`**: `id`, `client_id`, `outlet_id`, `room_number`, `room_type`, `status`
   * **`bookings`**: `id`, `client_id`, `outlet_id`, `guest_name`, `guest_phone`, `check_in`, `check_out`, `status`
2. Initialize Alembic and create initial migration (`0001_initial_schema.py`).
3. Create `app/db/seed.py` with Grand Palace Hotel demo data:
   * Client: `Grand Palace Hotel` (`cl_grand_palace`)
   * 4 Outlets: *Ichalkaranji*, *Kolhapur*, *Sangli*, *Mumbai*
   * Users: 1 Owner, 2 Managers, 4 Staff members (assigned to outlets with WhatsApp numbers, `can_login=False`).

---

### **Phase 3: Core Authentication, Security & Staff Guard**
1. Implement `app/core/security.py` for password hashing & JWT encoding/decoding.
2. Implement `app/services/auth_service.py`:
   * Validate email/password.
   * **Staff Login Guard**: Reject login if `role == 'STAFF'` or `can_login is False` (`403 Forbidden`).
   * Issue HttpOnly, Secure, SameSite=Lax `access_token` cookie containing `user_id`, `client_id`, `outlet_id`, and `role`.
3. Create REST auth router (`app/routers/auth_router.py`).

---

### **Phase 4: GraphQL Integration (`app/graphql/`)**
1. Implement `app/graphql/context.py` (`get_context` function):
   * Reads `access_token` HttpOnly cookie.
   * Decodes JWT & attaches `UserContext` (`user_id`, `client_id`, `outlet_id`, `role`) to `info.context.user`.
2. Define GraphQL Types (`UserType`, `OutletType`, `RoomType`, `BookingType`).
3. Implement GraphQL Queries:
   * `me`: Returns logged-in user profile & assigned outlets.
   * `outlets`: Returns outlets accessible by user.
   * `rooms(status)`: Scoped by `client_id` & `outlet_id`.
   * `bookings(dateRange)`: Scoped by `client_id` & `outlet_id`.
4. Implement GraphQL Mutations:
   * `createBooking`: Validates room availability & creates booking.
   * `updateRoomStatus`: Updates room dirty/clean state.
   * `switchActiveOutlet`: Re-issues JWT cookie with updated `outlet_id`.

---

### **Phase 5: Operations Excel Export & Public Direct Booking REST API**
1. Implement `app/services/export_service.py`:
   * Queries bookings for given date range filtered by `client_id` & `outlet_id`.
   * Formats data into Pandas DataFrame and generates formatted `.xlsx` / `.csv` file.
2. Implement `app/routers/export_router.py`:
   * Endpoint `GET /api/v1/reports/operations-excel` returning file download stream.
3. Implement `app/routers/public_router.py`:
   * Public endpoints for direct guest booking page (`/book/:outletId`).
   * No authentication required; auto-assigns available room.

---

### **Phase 6: WhatsApp Ops Service Stub (`app/services/whatsapp_service.py`)**
1. Implement WhatsApp notification service helper:
   * Sends housekeeping task alerts & room service dispatches directly to staff members' stored WhatsApp phone numbers (`user.phone`).
   * Log notification events in `audit_logs` table.

---

### **Phase 7: End-to-End Verification & Frontend Integration**
1. Run backend server using `uvicorn app.main:app --reload --port 8000`.
2. Connect `HRM-frontend` to `http://localhost:8000`.
3. Verify login flows:
   * Owner/Manager login -> Receives HttpOnly cookie -> Accesses dashboard.
   * Staff login attempt -> Blocked with `403 Forbidden`.
4. Verify multi-tenancy: Switching active outlet correctly filters room grids & bookings.
5. Verify Operations Excel download.
