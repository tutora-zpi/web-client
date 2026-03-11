# Tutora – Web Client

> AI-powered tutoring platform designed to organize and support online learning.

A web application developed as part of an engineering thesis project at the Wrocław University of Science and Technology (ZPI). Tutora provides an interactive environment for tutors and students — including real-time meetings, collaborative whiteboards, chat, notes, and AI-assisted learning.

## ⚡ Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| UI | [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) |
| State & Data | [React Query](https://tanstack.com/query), [React Hook Form](https://react-hook-form.com/) |
| Real-time | WebSockets, WebRTC |
| Whiteboard | [Excalidraw](https://excalidraw.com/) |
| PWA | next-pwa |

## 📁 Project Structure

```
├── app/                # Next.js App Router pages & layouts
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard & invitations
│   ├── login/          # Login page
│   └── room/           # Room / classroom view
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities & shared logic
├── types/              # TypeScript type definitions
├── public/             # Static assets
└── middleware.ts       # Next.js middleware (auth, routing)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm / bun)

### 1. Clone the repository

```bash
git clone https://github.com/tutora-zpi/web-client.git
cd web-client
```

### 2. Set up environment variables

```bash
cp .env.sample .env.local
```

Edit `.env.local` with the appropriate service URLs:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_BOARD_SERVICE` | `http://localhost:8001` | Whiteboard service |
| `NEXT_PUBLIC_CHAT_SERVICE` | `http://localhost:8002` | Chat service |
| `NEXT_PUBLIC_MEETING_SCHEDULER_SERVICE` | `http://localhost:8003` | Meeting scheduler |
| `NEXT_PUBLIC_WEB_RTC_SERVICE` | `http://localhost:8004` | WebRTC service |
| `NEXT_PUBLIC_USER_SERVICE` | `http://localhost:8080` | User service |
| `NEXT_PUBLIC_CLASS_SERVICE` | `http://localhost:8081` | Class management service |
| `NEXT_PUBLIC_NOTIFICATION_SERVICE` | `http://localhost:8888` | Notification service |
| `NEXT_PUBLIC_NEXT_JS_API_URL` | `http://localhost:3000/api` | Next.js API proxy |
| `NEXT_PUBLIC_WEBSOCKET_GATEWAY` | `ws://localhost:8010` | WebSocket gateway |
| `NEXT_PUBLIC_NOTE_SERVICE` | `http://localhost:8005/api` | Note service |

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
