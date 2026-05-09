# Honeybee — project setup guide

This guide walks through setting up the entire Honeybee development environment from scratch. Follow each section in order — every step depends on the ones before it.

---

## Prerequisites

Install these before anything else:

- **Node.js 20+** — download from https://nodejs.org (LTS version)
- **Git** — download from https://git-scm.com
- **Supabase CLI** — `npm install -g supabase`
- **Expo CLI** — `npm install -g expo-cli`
- **VS Code** (recommended) — with these extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Supabase (official)

---

## 1. GitHub repository setup

### Create the repository

1. Go to https://github.com/new
2. Repository name: `honeybee`
3. Visibility: **Private**
4. Do NOT initialize with README (we'll push our local code)
5. Click "Create repository"

### Security settings (critical)

Go to **Settings → General**:
- Under "Pull Requests," check **"Automatically delete head branches"**
- Under "Merge button," uncheck "Allow merge commits" — keep only **"Allow squash merging"** (cleaner history)

Go to **Settings → Branches**:
- Add a branch protection rule for `main`:
  - Check **"Require a pull request before merging"**
  - Check **"Require approvals"** (set to 1 when you have a team)
  - Check **"Require status checks to pass before merging"** (enable once CI is set up)
  - Check **"Do not allow bypassing the above settings"**
  - Check **"Restrict deletions"**

Go to **Settings → Secrets and variables → Actions**:
- You'll add these later: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, `VERCEL_TOKEN`
- NEVER commit secrets to the repository

Go to **Settings → Code security**:
- Enable **Dependabot alerts**
- Enable **Dependabot security updates**
- Enable **Secret scanning** — this catches accidentally committed API keys

### Clone and push

```bash
cd ~/projects  # or wherever you keep code
git clone https://github.com/YOUR_USERNAME/honeybee.git
cd honeybee
# Copy all the project files into this directory
git add .
git commit -m "feat: initial project scaffold"
git push origin main
```

---

## 2. Supabase project setup

### Create the project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Organization: create one called "Honeybee" if you don't have one
4. Project name: `honeybee-production` (you'll create a separate `honeybee-staging` later)
5. Database password: **generate a strong password and save it in a password manager** — you'll need it for migrations
6. Region: choose the closest to your primary users (e.g., `us-west-1` for Utah)
7. Plan: Free tier is fine for MVP development

### Security settings (critical)

**Settings → API:**
- Note your **Project URL** and **anon key** — these go in `.env`
- Note your **service_role key** — this is a GOD KEY. Never expose it in client code. It goes in server-side `.env` only.
- Under "API Settings," ensure **Row Level Security (RLS)** is enforced (it is by default)

**Settings → Auth:**
- **Site URL**: set to `http://localhost:3000` for now (update to production URL later)
- **Redirect URLs**: add these:
  - `http://localhost:3000/**`
  - `http://localhost:8081/**` (Expo dev)
  - `exp://localhost:8081/**` (Expo deep link)
  - Your production URLs when ready
- **Auth providers**: enable Email (enabled by default)
- **Email auth settings**:
  - Enable **"Confirm email"** — users must verify their email
  - Set **"Minimum password length"** to 8
  - Enable **"Prevent use of leaked passwords"**
- **Rate limits** (Settings → Auth → Rate Limits):
  - These are set sensibly by default; don't loosen them
- **JWT expiry**: default 3600 seconds (1 hour) is fine
- **Session settings**: Enable **"MFA"** under Authentication → Multi-Factor Authentication (you'll want this for clinic admin accounts)

**Settings → Database:**
- **SSL enforcement**: ensure "Enforce SSL on incoming connections" is ON
- **Network restrictions**: for production, restrict to known IP ranges. For development, leave open.

**Settings → Edge Functions:**
- **JWT verification**: enabled by default — keep it on
- **Import map**: you'll configure this per-function

### Link local project to Supabase

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# Run the initial migration
supabase db push
```

### Create a staging project (recommended)

Repeat the steps above to create `honeybee-staging`. This gives you a safe environment to test database changes before they hit production. Use the staging project for development and CI.

---

## 3. Vercel setup (for web dashboard)

### Create the project

1. Go to https://vercel.com and sign in with GitHub
2. Click "Import Project"
3. Select the `honeybee` repository
4. **Root Directory**: set to `apps/web`
5. **Framework Preset**: Next.js (auto-detected)
6. **Build Command**: leave default (`next build`)
7. **Output Directory**: leave default

### Environment variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Environment | Value |
|----------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Your Supabase service role key |
| `STRIPE_SECRET_KEY` | Production | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Production | Your Stripe webhook secret |
| `RESEND_API_KEY` | Production | Your Resend API key |

**Critical**: never put `SUPABASE_SERVICE_ROLE_KEY` in any variable prefixed with `NEXT_PUBLIC_` — that exposes it to the browser.

### Security settings

**Settings → General:**
- Enable **"Skew protection"** — prevents deployment timing issues

**Settings → Security:**
- Enable **"Deployment protection"** for Preview deployments (password-protects preview URLs)
- Enable **"Vercel Authentication"** if you want to gate staging access

**Settings → Git:**
- Production branch: `main`
- Enable **"Preview deployments"** for pull requests — every PR gets its own URL for testing

---

## 4. Stripe setup (subscriptions only)

1. Go to https://dashboard.stripe.com and create an account
2. **Do NOT activate live mode yet** — stay in test mode for development
3. Go to **Developers → API keys**:
   - Copy the **test publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy the **test secret key** → `STRIPE_SECRET_KEY`
4. Go to **Developers → Webhooks**:
   - Add endpoint: `https://YOUR_VERCEL_URL/api/webhooks/stripe`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **signing secret** → `STRIPE_WEBHOOK_SECRET`

### Test mode safety

- Use Stripe's test card numbers for all development: `4242 4242 4242 4242`
- Never use real card numbers in test mode
- When ready for production, create separate live API keys

---

## 5. Local development

### Install dependencies

```bash
# From the repository root
npm install
```

### Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Run the database migration

```bash
supabase db push
```

### Start development

```bash
# Start everything (web + mobile)
npm run dev

# Or start individually
npm run dev:web    # Next.js on http://localhost:3000
npm run dev:mobile # Expo on http://localhost:8081
```

---

## 6. Branching strategy

Use this workflow for all changes:

```
main (production)
 └── develop (integration branch)
      ├── feature/chip-registration
      ├── feature/medical-records
      ├── fix/auth-redirect
      └── chore/update-deps
```

1. Create a feature branch from `develop`: `git checkout -b feature/my-feature develop`
2. Make changes, commit with clear messages
3. Push and create a Pull Request to `develop`
4. After review and CI passes, squash merge
5. Periodically merge `develop` → `main` for production releases

### Commit message format

```
type: short description

type options:
  feat     — new feature
  fix      — bug fix
  docs     — documentation
  chore    — maintenance (deps, config)
  refactor — code restructure without behavior change
  test     — adding tests
```

---

## 7. Security checklist

Run through this before every deployment:

- [ ] No secrets in code or git history (run `git log --all -p | grep -i "key\|secret\|password"`)
- [ ] All Supabase tables have RLS policies enabled
- [ ] Service role key is ONLY used in server-side code
- [ ] API routes validate user authentication
- [ ] Input is validated and sanitized on both client and server
- [ ] CORS is configured to allow only your domains
- [ ] Database queries use parameterized inputs (Supabase client does this automatically)
- [ ] File uploads are restricted by type and size
- [ ] Rate limiting is in place for sensitive endpoints
- [ ] Error messages don't leak internal details to clients
- [ ] Dependencies are up to date (run `npm audit`)
- [ ] Dependabot alerts are addressed promptly

---

## 8. When you bring on developers

Hand them this checklist:

1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in staging credentials
3. Read this SETUP.md
4. Read the README.md for architecture overview
5. Run `npm run dev` — they should see both web and mobile running
6. Create a feature branch and make a small change to verify their setup works
7. Push and create a PR to confirm CI passes

The monorepo structure means they can work on any piece independently. The shared types in `packages/shared` ensure consistency across all apps.
