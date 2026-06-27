# AGENTS.md

## Project Context

This is a React/Vite portfolio site with a small Express API and SQLite database. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for Docker Compose setup, local setup, build, and preview commands.

## Key Files

- `src/`: frontend application source.
- `src/pages/`: routed site pages.
- `src/components/`: shared and page-specific components.
- `public/assets/`: local image assets used by the site.
- `server/`: Express API, SQLite access, and admin session auth.
- `vite.config.js`: Vite config.
- `Dockerfile` and `docker-compose.yml`: containerized development workflow.

## Working Notes

- Use `docker compose up --build` as the default local development command.
- Use `npm run dev` only when Node.js/npm are available locally and Docker is not needed.
- Use `npm run build` to create the production bundle in `dist/`.
- Use `npm run preview` to inspect the production bundle locally.
- The admin panel requires a server session; protected writes go through `/api/content`.
- SQLite data is stored in Docker volume `sqlite_data` by default.
- The contact form opens the user's mail app with a prefilled `mailto:` message.
- Run relevant checks from `package.json` before finishing code changes.
