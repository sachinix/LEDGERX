# LedgerX 🏦

A full-stack digital banking application built to model how real financial systems handle money movement — with a proper double-entry ledger, concurrency-safe transfers, and idempotent transaction processing.

**Live app:** [ledgerx-one.vercel.app](https://ledgerx-one.vercel.app)
**API:** [ledgerx-server.onrender.com](https://ledgerx-server.onrender.com)

> ⚠️ Backend runs on Render's free tier — the first request after inactivity may take 30–50s to wake up (cold start).

---

## Table of Contents

- [Overview](#overview)
- [What Makes This Different](#what-makes-this-different)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started (Local Setup)](#getting-started-local-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Overview

LedgerX lets users register, open a bank account, and transfer money to other accounts — with an admin/system role that can seed funds and move money across any account. It's built as a placement portfolio project, with a focus on getting the *hard parts* of a banking system right: data integrity, concurrency, and auditability — not just CRUD.

## What Makes This Different

Most beginner banking-app clones store a single mutable `balance` number and update it directly. LedgerX instead:

- **Uses double-entry bookkeeping.** Every transfer creates two immutable ledger entries (a DEBIT and a CREDIT). Balance is *derived* from the ledger, not stored as ground truth — the same pattern real accounting and financial systems use. Ledger entries can never be updated or deleted once created.
- **Is safe under concurrent transfers.** A naive "check balance, then debit" approach has a race window — two simultaneous transfers can both pass the balance check before either commits, overdrawing the account. LedgerX closes this with an atomic conditional update (`findOneAndUpdate` with a `$gte` balance guard + `$inc`), so the check-and-debit happens as a single indivisible database operation.
- **Is idempotent.** Every transfer carries a client-generated idempotency key. Retried or duplicated requests are recognized and short-circuited instead of creating duplicate transfers.
- **Keeps transfers atomic end-to-end.** Each transfer runs inside a MongoDB session/transaction — if any step fails, everything rolls back; nothing partially commits.

## Tech Stack

**Frontend:** React, React Router, Tailwind CSS, Axios, React Hot Toast
**Backend:** Node.js, Express, MongoDB + Mongoose
**Auth:** JWT (HttpOnly cookie + Bearer fallback), bcrypt password hashing, token blacklist on logout
**Email:** Resend (transactional email API)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Architecture

```
Client (React)
   │
   │  JWT (httpOnly cookie)
   ▼
Express API
   │
   ├── authMiddleware / authSystemUserMiddleware  → role-based route protection
   ├── Transaction Controller
   │      ├── validates request + idempotency key
   │      ├── opens MongoDB session
   │      ├── atomic conditional debit ($gte guard + $inc)
   │      ├── atomic credit
   │      ├── writes DEBIT + CREDIT ledger entries
   │      └── commits session / rolls back on failure
   │
   ▼
MongoDB Atlas
   ├── users
   ├── accounts (cached `balance` field, kept in sync via atomic updates)
   ├── transactions (status: PENDING/COMPLETED/FAILED/REVERSED)
   └── ledgers (immutable CREDIT/DEBIT entries — source of truth for balance)
```

### Data Model

| Model | Purpose |
|---|---|
| `User` | Auth identity — email, hashed password, `systemUser` flag for admin role |
| `Account` | A bank account owned by a user — currency, status, cached balance |
| `Transaction` | A transfer record — fromAccount, toAccount, amount, status, idempotency key |
| `Ledger` | Immutable double-entry records (CREDIT/DEBIT) — the audit trail balance is computed from |
| `TokenBlacklist` | Logged-out JWTs, TTL-expired automatically |

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas connection string)
- A [Resend](https://resend.com) API key (for email)

### Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see [Environment Variables](#environment-variables)).

```bash
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Environment Variables

**`server/.env`**

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:5173
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3000/api
```

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Log in, receive JWT |
| POST | `/api/auth/logout` | User | Log out, blacklist token |
| POST | `/api/accounts` | User | Create a bank account |
| GET | `/api/accounts` | User | List own accounts |
| GET | `/api/accounts/balance/:accountId` | User | Get balance for an account |
| GET | `/api/accounts/admin/all` | Admin | List all accounts in the system |
| POST | `/api/transactions` | User | Transfer money from own account |
| GET | `/api/transactions` | User | Own transaction history |
| POST | `/api/transactions/admin/transfer` | Admin | Transfer between any two accounts |
| GET | `/api/transactions/admin/all` | Admin | All transactions in the system |
| POST | `/api/transactions/system/initial-funds` | Admin | Seed funds into an account |

## Roadmap

- [ ] Rate limiting on auth endpoints
- [ ] Paginated transaction history
- [ ] Transaction reversal/refund flow
- [ ] Verified sending domain for unrestricted email delivery
- [ ] Automated tests (unit + integration) for the transfer flow, including a concurrency test simulating simultaneous transfers

---

Built by [Sachin](https://github.com/sachinix) as a placement portfolio project.
