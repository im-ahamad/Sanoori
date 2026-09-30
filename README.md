This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), extended with a simple PostgreSQL + Prisma backend.

## Backend & Database

Stack: Next.js Route Handlers / Server code → Prisma ORM → PostgreSQL.

Setup:

```bash
cp .env.example .env        # then set a real DATABASE_URL
npm install
```

Database commands:

```bash
npm run db:validate   # validate the Prisma schema
npm run db:generate   # generate the Prisma client (into src/generated/prisma)
npm run db:migrate    # create & apply a dev migration (prisma migrate dev)
npm run db:deploy     # apply pending migrations (production)
npm run db:seed       # insert reference/demo data (categories, subcategories, [DEMO] products)
npm run db:studio     # open Prisma Studio
npm run db:create-admin -- --email admin@example.com --password 'your-password' [--name 'Name'] [--activate]
npm run db:create-admin -- --list      # list accounts (no hashes, no passwords)
```

Admin area:

- Login at `/admin/login`, dashboard at `/admin` (Auth.js v5 / credentials).
- Create or reset the admin account with the `db:create-admin` script above. Passwords are bcrypt-hashed; plain text is never stored or printed.
- There is no "forgot password" flow: that script is the recovery path. It can also list accounts (`--list`) and re-enable a deactivated one (`--activate`). Pass the password via `SANOORI_ADMIN_PASSWORD` instead of `--password` to keep it out of your shell history.
- Requires `AUTH_SECRET` (generate with `openssl rand -base64 32`) and, off localhost, `AUTH_TRUST_HOST=true`.

Notes:

- The generated client is written to `src/generated/prisma`, which is git-ignored. Run `npm run db:generate` after pulling or after schema changes.
- Business contact details (phone, WhatsApp, social links) stay centralized in `src/config/site.ts` and are resolved through `src/lib/contact-channels.ts`.

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
