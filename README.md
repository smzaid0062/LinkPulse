# LinkPulse

A URL shortener with click analytics, built phase by phase to learn DevOps and SRE practices. The app itself stays simple on purpose, so the focus is on how it is built, shipped, observed and kept reliable.

## Features

- Shorten any http/https URL into a 7-character code
- `302` redirect with per-link click counting
- Per-link stats (total clicks, last clicked time)
- React UI to create links, copy them and view recent links
- Health endpoint for container and Kubernetes probes

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| API | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Coming later | Redis, background worker, Docker, GitHub Actions, Terraform, Kubernetes, ArgoCD, Prometheus, Grafana |

## How it works

**Creating a link**

1. The client sends `POST /api/links` with a long URL.
2. The API validates the URL and generates a random base62 code.
3. The link is saved in MongoDB and the short URL is returned. On a code collision, the API retries with a new code.

**Opening a link**

1. The browser requests `GET /:code`.
2. The API looks up the code, increments the click counter and responds with `302 Found`.
3. The browser follows the `Location` header to the original URL.

The redirect uses `302` instead of `301` so that every click reaches the server and gets counted.

## Project structure

```
linkpulse/
├── app/
│   ├── api/                # Express API
│   │   └── src/
│   │       ├── models/     # Mongoose models
│   │       ├── routes/     # API routes
│   │       ├── utils/      # Short code generator
│   │       └── server.js
│   └── frontend/           # React + Vite app
├── docs/                   # Architecture, SLOs, runbooks, postmortems (added over time)
├── .gitignore
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or later
- Docker (used here only to run MongoDB) or a local MongoDB installation

### 1. Start MongoDB

```bash
docker run -d --name linkpulse-mongo -p 27017:27017 mongo:7
```

### 2. Start the API

```bash
cd app/api
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Start the frontend

```bash
cd app/frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Configuration

Environment variables for the API (`app/api/.env`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the API listens on |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/linkpulse` | MongoDB connection string |
| `BASE_URL` | `http://localhost:5000` | Public base URL used to build short links |

`BASE_URL` is only a prefix for generated short links. The database stores just the code, so changing the domain later does not break existing links.

## API reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/links` | Create a short link. Body: `{ "url": "https://example.com" }` |
| `GET` | `/api/links` | List the 10 most recent links |
| `GET` | `/api/links/:code/stats` | Get stats for one link |
| `GET` | `/:code` | Redirect to the original URL and count the click |
| `GET` | `/health` | Health check (reports database status) |

### Example

```bash
# Create a link
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'

# Follow the redirect (replace <code> with the returned code)
curl -i http://localhost:5000/<code>

# View stats
curl http://localhost:5000/api/links/<code>/stats
```

## Git workflow

- `main` is protected. All changes go through pull requests.
- One task per branch, using these prefixes: `feat/`, `fix/`, `chore/`, `docs/`.
- Commit messages follow the same prefixes, for example `feat: add Dockerfile for API`.
- Pull requests are squash-merged and the branch is deleted afterwards.

## Roadmap

- [x] **Phase 0:** App and Git workflow
- [ ] **Phase 1:** Docker and docker-compose
- [ ] **Phase 2:** CI with GitHub Actions
- [ ] **Phase 3:** First deployment (EC2, Nginx, HTTPS) and CD
- [ ] **Phase 4:** Infrastructure as Code with Terraform
- [ ] **Phase 5:** Kubernetes and Helm
- [ ] **Phase 6:** GitOps with ArgoCD
- [ ] **Phase 7:** Observability (Prometheus, Grafana, Loki)
- [ ] **Phase 8:** DevSecOps (Trivy, Gitleaks, SAST)
- [ ] **Phase 9:** SRE layer (SLOs, canary releases, chaos testing)
- [ ] **Phase 10:** Documentation and polish

## License

MIT
