## Real Estate Lead Automation (MVP v1)

Next.js (App Router) + Tailwind + Supabase Auth + Prisma (Postgres).

### Getting started (local)

- **Install deps**

```bash
cd lead-automation
npm install
```

- **Configure env**

```bash
cp .env.example .env
```

Set at least:

- `DATABASE_URL` (your Supabase Postgres connection string)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET` (used to protect `/api/cron/run-jobs`)

- **(Optional) enable real scoring**

- Set `OPENAI_API_KEY` to use OpenAI structured output scoring.
- If not set, scoring uses a deterministic stub so you can still demo end-to-end.

- **Run Prisma migrations**

```bash
npm run db:migrate
```

- **Seed demo tenant + lead sources**

```bash
npm run db:seed
```

This seeds:

- `tenantSlug`: `demo`
- website lead source secret: `demo_website_secret`
- facebook lead source secret: `demo_fb_secret`

- **Start dev server**

```bash
npm run dev
```

Then open `http://localhost:3000`.

### End-to-end local demo (ingest → jobs)

With the dev server running:

```bash
npm run e2e:local
```

This will:

- POST a sample lead to `POST /api/ingest/form` (hosted form ingest)
- Call `POST /api/cron/run-jobs` twice (process SCORE_LEAD, then SEND_SMS/CRM_SYNC stubs)

You should see logs like:

- `[webhook] ...`
- `[sms:stub] ...`

### Ingestion endpoints (MVP v1)

- `POST /api/ingest/form` (hosted form)
  - body includes `tenantSlug`
- `POST /api/ingest/website` (agent website webhook)
  - header: `x-lead-source-secret: <secret>`
- `POST /api/ingest/facebook` (FB lead ads via Zapier/Make posting normalized payload)
  - header: `x-lead-source-secret: <secret>`

### Cron job runner

- `POST /api/cron/run-jobs`
  - header: `x-cron-secret: <CRON_SECRET>`

### Auth routes

- `GET /signup` create account (email/password)
- `GET /login` sign in
- `/app/*` is protected by middleware (requires an authenticated session)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
