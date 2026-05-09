# Honeybee

The smart microchip that connects pets, owners, and veterinarians.

Honeybee is a dual-antenna microchip (NFC + 134.2 kHz) paired with a cloud platform that unifies pet identity, medical records, and owner access in a single system.

---

## Architecture

```
Client apps
├── Mobile (Expo/React Native) — pet owner app (iOS + Android)
├── Web (Next.js on Vercel) — vet clinic dashboard
└── NFC scan page — public, no auth required

Unified backend (Supabase)
├── Auth — email/password with role-based access (pet_owner, clinic_admin, clinic_staff)
├── Postgres — all application data with Row-Level Security on every table
├── Edge Functions — business logic (AI summaries, wallet passes, chip registration)
├── File Storage — pet photos, medical attachments, org logos
└── Realtime — live updates for dashboard

External services
├── Anthropic API — medical record summarization (swappable)
├── Stripe Billing — subscription management only
├── Apple Wallet + Google Wallet — digital pet ID passes
└── Resend — transactional email
```

## Monorepo structure

```
honeybee/
├── apps/
│   ├── mobile/              Expo app (pet owners)
│   └── web/                 Next.js app (vet clinics)
├── packages/
│   ├── shared/              Types, constants, utilities
│   └── supabase-client/     Supabase client factory
├── supabase/
│   ├── migrations/          SQL schema migrations
│   ├── functions/           Edge Functions (Deno)
│   └── config.toml          Supabase project config
├── .github/workflows/       CI/CD
├── turbo.json               Monorepo build pipeline
└── SETUP.md                 Full setup guide
```

## Key design decisions

**Why Supabase as the unified backend?**
Both the mobile app and web dashboard talk to the same Supabase instance. Auth, database, and storage are shared — no duplicated logic. If we outgrow Supabase, the database is standard Postgres and migrates to any managed provider.

**Why a monorepo?**
Shared types in `packages/shared` mean the mobile app and web dashboard always agree on data shapes. Change a type once, both apps see it. New developers clone one repo and can run everything.

**Why Expo for mobile?**
Same language (TypeScript) and framework (React) as the web dashboard. One developer skill set covers both platforms. Expo handles app store builds, push notifications, and over-the-air updates through EAS.

**Why abstract the AI layer?**
The AI service is called through a Supabase Edge Function with a clean interface. Today it calls Anthropic. If we need self-hosted models for security or cost, we swap the implementation in one file.

## Getting started

See [SETUP.md](./SETUP.md) for the full setup guide including Supabase, GitHub, Vercel, and Stripe configuration with security best practices.

Quick start:

```bash
git clone https://github.com/YOUR_USERNAME/honeybee.git
cd honeybee
npm install
cp .env.example .env.local
# Fill in .env.local with your credentials
npm run dev
```

## Database

The schema is defined in `supabase/migrations/001_initial_schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `organizations` | Vet clinics |
| `profiles` | All users (pet owners + clinic staff) |
| `pets` | Pet records |
| `chips` | Microchip registration and status |
| `medical_records` | Exam notes, vaccinations, labs, prescriptions |
| `medical_summaries` | AI-generated health summaries |
| `wallet_passes` | Apple + Google wallet pass data |
| `scan_logs` | Anonymous NFC scan events |
| `audit_logs` | Action tracking for compliance |

Every table has Row-Level Security (RLS) enabled. Pet owners see only their own data. Clinic staff see only patients at their clinic.

## Branching

```
main          — production (protected)
└── develop   — integration branch
     └── feature/xyz — individual features
```

See SETUP.md for the full branching and commit message guidelines.
