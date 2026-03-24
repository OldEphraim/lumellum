A lumellum is the knife used to scrape hide into vellum.
This is the knife for your thoughts.

## Quickstart

1. Clone this repository
2. `cp .env.example .env`
3. Fill in your `ANTHROPIC_API_KEY` and `TAVILY_API_KEY` in `.env`
4. `docker compose up`
5. Open [http://localhost:3000](http://localhost:3000)

## Files

- `src/index.ts` — Hono HTTP server, serves static files and API routes
- `src/agent.ts` — Stateless streaming agent function with agentic tool-use loop
- `src/session.ts` — In-memory session store (Map of message histories)
- `src/tools/index.ts` — Tool registry and executor
- `src/tools/webSearch.ts` — Tavily web search integration
- `public/index.html` — Self-contained chat UI with dark parchment theme
- `Dockerfile` — Single-stage Docker build with type checking
- `docker-compose.yml` — One-service compose configuration

## API Keys

- **Anthropic**: Get your key at [console.anthropic.com](https://console.anthropic.com/)
- **Tavily**: Get a free API key at [app.tavily.com](https://app.tavily.com/) (free tier: 1000 searches/month)
