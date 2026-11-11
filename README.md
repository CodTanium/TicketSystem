# ðŸŽŸï¸ Ticket System

![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-database-003B57?logo=sqlite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
[![CI](https://github.com/CodTanium/TicketSystem/actions/workflows/ci.yml/badge.svg)](https://github.com/CodTanium/TicketSystem/actions/workflows/ci.yml)

A small full-stack app for **one-time ticket codes**: create a ticket, hand out its code, and check it in at the door. A code can be used **exactly once**, even if two people try at the same moment.

**Live demo:** [ticketsystem-1frontend.onrender.com](https://ticketsystem-1frontend.onrender.com) (free Render plan: the first request after a pause can take up to a minute while the server wakes up).

## Features

- âž• Create tickets with a random 8-character code (`3FA9C2B1`)
- âœ… Use a ticket: codes are case-insensitive and can only be used once
- ðŸ—‘ï¸ Delete unused tickets; used tickets stay as a record
- ðŸ“‹ List of all tickets, newest first, with used/unused status
- ðŸŒ“ Light and dark mode, keyboard friendly, clear error messages

## Tech stack

| Part | Technology |
|---|---|
| Backend | Node.js, Express 5, SQLite (`sqlite3`) |
| Frontend | React 19, Vite 8, oxlint |
| Tests | Node's built-in test runner (`node --test`) |
| Hosting | Render (backend and frontend) |

## Project structure

```
TicketSystem/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ app.js                  Express app: CORS, JSON, routes, error handling
â”‚   â”œâ”€â”€ server.js               starts the server (PORT, default 3000)
â”‚   â”œâ”€â”€ database.js             SQLite connection and table
â”‚   â”œâ”€â”€ routes/ticketRoutes.js
â”‚   â”œâ”€â”€ controllers/ticketController.js
â”‚   â””â”€â”€ test/tickets.test.js    API tests
â””â”€â”€ frontend/
    â””â”€â”€ src/App.jsx             the whole UI
```

## Run it locally

**Backend** (http://localhost:3000):

```bash
cd backend
npm install
npm start          # or: npm run dev  (restarts on changes)
npm test           # 8 API tests, in-memory database
```

**Frontend** (http://localhost:5173):

```bash
cd frontend
npm install
echo VITE_API_URL=http://localhost:3000/api/tickets > .env.local
npm run dev
```

### Settings (environment variables)

| Variable | Where | Default | Meaning |
|---|---|---|---|
| `PORT` | backend | `3000` | Port to listen on |
| `DB_PATH` | backend | `./tickets.db` | SQLite file (`:memory:` for tests) |
| `CORS_ORIGIN` | backend | Render frontend + `http://localhost:5173` | Allowed browser origins, comma-separated |
| `VITE_API_URL` | frontend | the Render API | Where the frontend sends requests |

## API

Base URL: `/api/tickets`

| Method | Path | Body | Answer |
|---|---|---|---|
| `GET` | `/` | â€“ | `200` list of `{ id, code, used }`, newest first |
| `POST` | `/` | â€“ | `201` the new ticket |
| `POST` | `/use` | `{ "code": "3FA9C2B1" }` | `200` used Â· `400` bad code Â· `404` not found Â· `409` already used |
| `DELETE` | `/:id` | â€“ | `200` deleted Â· `400` bad id Â· `404` not found or already used |
| `GET` | `/api/health` | â€“ | `200 { "status": "ok" }` |

## How "use once" is guaranteed

Using a ticket is a single SQL statement:

```sql
UPDATE tickets SET used = 1 WHERE code = ? AND used = 0
```

The database changes the row only if it is still unused, so two requests at the same time cannot both succeed. A test sends 10 requests for the same code at once and checks that exactly one wins.

## What I learned

- Building a REST API with Express and connecting it to SQLite
- Avoiding race conditions with an atomic database update instead of "read, then write"
- Configuring an app through environment variables for local, test and hosted runs
- Deploying a backend and a React frontend on Render

---

Made by [Masoud Dehdar](https://github.com/CodTanium).
