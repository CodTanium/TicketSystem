# Ticket System: frontend

React 19 + Vite. See the [main README](../README.md) for the whole project.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run lint       # oxlint
```

By default the app talks to the live API on Render. To use a local backend, create `frontend/.env.local`:

```
VITE_API_URL=http://localhost:3000/api/tickets
```
