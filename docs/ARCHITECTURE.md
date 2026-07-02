# NuraCare Architecture

NuraCare is a monorepo containing two main applications:
1. **Web App (`apps/web`)**: A React + Vite web application deployed on Vercel.
2. **Mobile App (`apps/mobile`)**: An Expo + React Native application targeting iOS and Android.

## Monorepo Structure
- `apps/web`: Web application source code.
- `apps/mobile`: Mobile application source code.
- `packages/shared`: Shared types, interfaces, and utilities.
- `supabase`: Database schema and migrations.

## Backend
Both applications share a Supabase backend for database, authentication, and realtime syncing. Vercel serverless functions (located in `apps/web/api`) provide external integrations (AI, payments, webhooks).
