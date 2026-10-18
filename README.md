# LinkPulse

URL shortener + click analytics. DevOps/SRE seekhne ke liye phase-by-phase project.

## Phase 0: Local run

**Requirements:** Node 20+, Docker (sirf MongoDB ke liye) ya local MongoDB.

```bash
# 1. MongoDB chalao
docker run -d --name linkpulse-mongo -p 27017:27017 mongo:7

# 2. API
cd app/api
cp .env.example .env
npm install
npm run dev            # http://localhost:5000

# 3. Frontend (naya terminal)
cd app/frontend
npm install
npm run dev            # http://localhost:5173
```

## API

| Method | Path | Kaam |
|---|---|---|
| POST | `/api/links` | `{ "url": "https://..." }` -> short link banao |
| GET | `/api/links` | latest 10 links |
| GET | `/api/links/:code/stats` | ek link ke stats |
| GET | `/:code` | 302 redirect + click count +1 |
| GET | `/health` | health check |

## Quick test

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'

curl -i http://localhost:5000/<code>          # 302 + Location header
curl http://localhost:5000/api/links/<code>/stats
```

## Roadmap
- [x] Phase 0: App + Git
- [ ] Phase 1: Docker + docker-compose
- [ ] Phase 2: CI (GitHub Actions)
- [ ] Phase 3: First deploy (EC2 + Nginx + HTTPS)
- [ ] Phase 4: Terraform
- [ ] Phase 5: Kubernetes
- [ ] Phase 6: GitOps (ArgoCD)
- [ ] Phase 7: Observability
- [ ] Phase 8: DevSecOps
- [ ] Phase 9: SRE layer
- [ ] Phase 10: Polish
