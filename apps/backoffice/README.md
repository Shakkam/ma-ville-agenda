# Ma Ville Agenda — Backoffice Admin

Next.js web application for super-admin event management.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd apps/backoffice
npm install
```

### Configuration

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Set your API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email**: admin@ma-ville-agenda.local
- **Password**: admin123

### Building for Production

```bash
npm run build
npm run start
```

## Features

- **Authentication** — Super-admin login with token management
- **Event Management** — Create, edit, archive events
- **Validation Queue** — Review pending event submissions
- **Event History** — View and manage published events
- **Form Validation** — Client-side form validation with React Hook Form

## Project Structure

- `app/` — Next.js pages and routes
- `lib/`
  - `api/` — API client functions
  - `store/` — Zustand state management
  - `types.ts` — TypeScript types
- `styles/` — Global CSS
