## Universal Garment Pattern Frontend (`ZmanculatorFront`)

This is the **frontend-only control and visualization layer** for the universal garment pattern construction platform.  
It talks to a **headless FastAPI backend** that owns all drafting, geometry, and subscription logic.

### Tech stack

- **Framework**: Next.js (App Router) + React (functional components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data fetching**: React Query (`@tanstack/react-query`)
- **Visualization**: SVG-based pattern viewer

### Project structure (high level)

- `src/app/` – Next.js App Router pages and layouts
  - `auth/login` – login screen
  - `dashboard` – primary workflow entry
  - (future) `projects`, `patterns`, `measurements`, `schools`, `exports`, `settings`
- `src/lib/` – shared utilities
  - `config.ts` – environment/config helpers
  - `apiClient.ts` – typed API client wrapper
  - `reactQuery.tsx` – React Query provider
  - `auth/` – token storage and auth context

### Backend integration

The frontend expects a FastAPI backend available at:

- `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000/v1` in development)

Key endpoints used initially:

- `POST /auth/login` – obtains an access token (JWT) using email + password.
- Protected endpoints must accept `Authorization: Bearer <token>`.

### Getting started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Create a `.env.local` file in the project root if you want to override the default API URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/v1
```

3. **Run the development server**

```bash
npm run dev
```

Open `http://localhost:3000/auth/login` to reach the login screen.

### Conventions

- No drafting or geometry logic lives in the frontend.
- Pattern and project data are treated as **immutable** outputs from the backend.
- Subscription and feature access are fully driven by backend capability flags; the frontend never hardcodes tiers.

