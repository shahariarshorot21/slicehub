# SliceHub

SliceHub is a full-stack pizza ordering and delivery platform. Customers discover approved local pizzas and place orders; vendors manage menus and fulfil orders; admins moderate the marketplace.

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, sonner
- **Backend:** Express + TypeScript, MongoDB (Mongoose), Better Auth, Stripe Checkout, ImgBB

## Roles

| Role | How it is created | Dashboard |
| --- | --- | --- |
| Customer | Public registration (Customer account type) | `/customer` |
| Vendor | Public registration (Vendor account type) | `/vendor` |
| Master admin | CLI only — `npm run setup:admin` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` | `/admin` |

Public signup accepts only the neutral `customer` or `vendor` account type. Admin is never accepted from the browser; it can only be provisioned by the server-side script and is bound to the configured master admin email. All protected endpoints verify the session, role, master admin identity and blocked state on the server; dashboard layouts are additionally guarded during server rendering. Role, blocked state and subscription plan are always re-read from MongoDB rather than trusted from a stale session. The Next.js `/api/auth/*` route is only a transparent proxy to the single Better Auth instance on the Express API.

Passwords must be at least 8 characters and include an uppercase letter, a lowercase letter and a number. Better Auth hashes passwords before storing them; plain-text passwords are never saved.

## Quick start

Prerequisites: Node.js 20+, a running MongoDB instance, and (for optional features) Google OAuth, Stripe and ImgBB credentials. Authentication supports email/password and Google OAuth.

The Express backend lives at `../slicehub-server` (the `server/` folder here only delegates to it).

```bash
# 1. Frontend dependencies (from SliceHub-client)
npm install --legacy-peer-deps

# 2. Backend dependencies
cd ../slicehub-server && npm install --legacy-peer-deps && cd ../SliceHub-client

# 3. Environment files
copy .env.example .env
copy ..\slicehub-server\.env.example ..\slicehub-server\.env

# 4. Edit both files with your real values (never commit them)

# 5. Create the first admin (after MongoDB is running)
cd ../slicehub-server && npm run create-admin && cd ../SliceHub-client

# 6. Optional: add 6 approved demo pizzas so the homepage is populated
cd ../slicehub-server && npm run seed && cd ../SliceHub-client

# 7. Run both apps in separate terminals
npm run dev                        # http://localhost:3000
cd ../slicehub-server && npm run dev # http://localhost:4000
```

Google OAuth setup: in Google Cloud Console create an OAuth 2.0 **Web application** client and add
`http://localhost:4000/api/auth/callback/google` as an authorized redirect URI. Put the client ID and
secret in `../slicehub-server/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The client never
receives the secret.

Stripe webhook endpoint: `POST http://localhost:4000/api/payments/webhook` (use Stripe CLI to forward locally). Premium activation happens **only** after the signature is verified. Customer pizza orders never use Stripe.

## Environment variables

**`../slicehub-server/.env` (Express API)**

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Random secret, 32+ characters |
| `BETTER_AUTH_URL` | Public API origin, e.g. `http://localhost:4000` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google Web OAuth credentials (server-only) |
| `NEXT_PUBLIC_BASE_URL` | Frontend origin, used for Stripe redirects and CORS |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Vendor premium checkout and webhook verification |
| `IMGBB_API_KEY` | Pizza image uploads |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used once by `npm run create-admin` |

**`.env` (Next.js frontend)**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Frontend origin |
| `NEXT_PUBLIC_API_URL` | API base URL (default `http://localhost:4000/api`) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth origin (default `http://localhost:4000`) |

## Feature map

- **Public:** homepage (hero, MongoDB-backed featured pizzas, categories, why-us, how-it-works), `/menu` with keyword search/category/location/min-max price filters and sorting, `/menu/[id]` details with restaurant profile, reviews and order modal.
- **Customer:** overview stats, order tracking + cancel pending, favourites, profile.
- **Vendor:** overview, menu CRUD with ImgBB upload, availability, approval status, incoming orders accept/reject, subscription + Stripe checkout, payment history, profile.
- **Admin:** statistics and charts, user search/filter/role-change/block/unblock, menu approval/rejection/edit/delete/unpublish/feature toggle, subscription overview with real payment history, all platform transactions.
- **Shared:** dark/light theme, role guards, protected APIs, toasts, loading/empty states, custom 404, blocked-account page, payment success/cancel pages.

Free vendors may keep up to **3 active menu items**. Premium vendors have no limit.

## Checks

```bash
npm run lint                 # frontend lint
npm run typecheck            # frontend types
npm run build                # production build
cd ../slicehub-server && npm run typecheck
```

On Windows, `test.bat` runs the lint and both type-check steps in one go.

If the build reports an out-of-memory error, rerun with `NODE_OPTIONS=--max-old-space-size=4096 npm run build`.
