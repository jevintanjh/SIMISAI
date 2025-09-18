# Repository Guidelines

## Project Structure & Module Organization
The Astro frontend lives in src/ (UI in components/, routes in pages/, shared hooks and utilities under hooks/ and utils/). The Express API sits in server/ with the entry index.ts, HTTP routes in outes.ts, and storage adapters in storage.ts. Shared types stay in shared/schema.ts and must match both front and back end imports via the @/ alias. Static assets live in public/, automation scripts in ws-deployment/, and computer-vision resources in cv_model/. Build output lands in dist/--never edit files there.

## Build, Test, and Development Commands
- pnpm install: restore dependencies.
- pnpm run dev: start the Astro dev server on port 3000.
- pnpm run dev:server: boot the Express API with 	sx.
- pnpm run dev:full: run both services for end-to-end iterations.
- pnpm run build: bundle the Astro app and server/index.ts.
- pnpm run start: serve the production bundle from dist/index.js.
- pnpm run check: type-check the project; run before every PR.
- pnpm run db:push: apply Drizzle migrations to the target database.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation and trailing commas. Components, hooks, and providers follow PascalCase, utilities use camelCase, and constants stay in UPPER_SNAKE_CASE. Keep files scoped by feature (for example, chat helpers in src/utils/suggestedQuestions.ts). When introducing shared contracts, update shared/schema.ts first and consume via the @/ path alias. Tailwind utilities should mirror existing ordering; prefer composition over inline styles.

## Testing Guidelines
We rely on type safety plus scripted smoke tests. Run pnpm run check and relevant PowerShell scripts in ws-deployment/test-scripts/ (for example, pwsh aws-deployment/test-scripts/deployment-testing/test-deployment.ps1) before sign-off. Document UI regressions with screenshots in ttached_assets/ until automated coverage lands. Computer-vision updates require python cv_model/testing.py to confirm YOLO predictions.

## Commit & Pull Request Guidelines
Commit subjects stay in the imperative mood (Remove, Clean up) and can include scopes (docs(aws): ...) as seen in history. Keep commits focused and bundle config or migration edits with their consumers. PRs must outline behaviour changes, link issues, mention new scripts or env vars, and attach UI or CV evidence when relevant (GIFs, confusion matrices, deployment screenshots).
