# BFHL Full Stack Challenge

A production-ready full-stack application that processes directed-graph node-edge input and builds visual hierarchy trees.

---

## Project Structure

```
.
├── src/                        # Express backend (MVC)
│   ├── config/env.js           # Environment config
│   ├── controllers/
│   │   └── bfhlController.js   # Route handlers
│   ├── middleware/
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── rateLimiter.js      # express-rate-limit
│   │   └── validateRequest.js  # Request body validation
│   ├── routes/
│   │   └── bfhlRoutes.js       # GET + POST /bfhl
│   ├── services/
│   │   └── bfhlService.js      # Full pipeline orchestration
│   ├── utils/
│   │   ├── cycleDetector.js    # DFS cycle detection
│   │   ├── graphBuilder.js     # Adjacency list builder
│   │   ├── groupSeparator.js   # Connected-component splitter
│   │   ├── logger.js           # Lightweight structured logger
│   │   ├── responseHelper.js   # sendSuccess / sendError
│   │   ├── rootDetector.js     # Natural root detection
│   │   ├── rootResolver.js     # Root with cyclic fallback
│   │   ├── treeBuilder.js      # Recursive nested tree + depth
│   │   └── validateEntry.js    # Entry format validation
│   ├── tests/
│   │   └── bfhl.test.js        # 13 Jest test cases
│   ├── app.js                  # Express app setup
│   └── server.js               # HTTP server entry point
│
├── frontend/                   # Vite + React + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── HierarchyCard.jsx
│       │   ├── SummaryPanel.jsx
│       │   └── TreeView.jsx    # Recursive, collapsible tree
│       └── App.jsx             # Main UI
│
├── .env.example
├── render.yaml                 # Render deployment config
└── README.md
```

---

## API

### `POST /bfhl`

**Request**
```json
{ "data": ["A->B", "A->C", "B->D", "X->Y", "A->B", "bad"] }
```

**Response**
```json
{
  "user_id": "",
  "email_id": "",
  "college_roll_number": "",
  "hierarchies": [
    { "root": "A", "tree": { "A": { "B": { "D": {} }, "C": {} } }, "depth": 3 },
    { "root": "X", "tree": { "X": { "Y": {} } }, "depth": 2 }
  ],
  "invalid_entries": ["bad"],
  "duplicate_edges": ["A->B"],
  "summary": {
    "total_trees": 2,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

### `GET /bfhl`
Returns `{ "operation_code": 1 }`.

---

## Business Rules

| Rule | Behaviour |
|---|---|
| Valid entry format | `A->B` — single uppercase letters only, no self-loops |
| Duplicate edges | First occurrence used; subsequent duplicates recorded in `duplicate_edges` |
| Multi-parent | First parent wins; later parents silently discarded |
| Root detection | Node that never appears as a child |
| Cyclic group | `has_cycle: true`, no `depth`, root = lex-smallest node |
| Depth | Node count on longest root-to-leaf path |
| `largest_tree_root` | Max depth; tie-break = lex-smaller root |

---

## Getting Started

### Backend

```bash
# Install deps
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start

# Tests
npm test

# Tests with coverage
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

> In development the frontend proxies `/bfhl` to `http://localhost:3000` automatically.
> In production set `VITE_API_URL` to your backend URL.

---

## Environment Variables

Copy `.env.example` to `.env`:

```
PORT=3000
NODE_ENV=development
```

---

## Deploying to Render

The `render.yaml` at the root configures two services:

| Service | Type | Build | Start |
|---|---|---|---|
| `bfhl-backend` | Web (Node) | `npm install` | `npm start` |
| `bfhl-frontend` | Static | `npm install && npm run build` | — |

1. Push to GitHub
2. Connect the repo in your Render dashboard — `render.yaml` will auto-configure both services
3. Set `VITE_API_URL` to the deployed backend URL in the frontend service's environment variables
