# Vision Express internal portal

A **Vite + React (JavaScript)** single-page app on **Supabase** (Postgres database, login,
and one Edge Function). It needs no server of its own: host the built files anywhere static
(Vercel, Netlify, Cloudflare Pages) and point them at the Supabase project.

| Part | Where |
| --- | --- |
| Pages | `src/pages` (styles in `src/styles/admin.css`) |
| Login and permissions | Supabase Auth (username is mapped to `<username>@ve-internal.local`) + `src/lib/auth.jsx` |
| Database schema, seed data, access rules | `supabase/migrations/` |
| Users admin (create, edit, activate) | `supabase/functions/admin-users` Edge Function |
| Intake form PDF | Generated in the browser with jsPDF (`src/lib/pdf.js`) |
| Price estimator rules | `src/lib/estimate.js` (with tests) |

Pages: Dashboard, Intake Forms (list / create / edit own / view / PDF), Refraction,
Referral Source report (monthly pie, yearly bars), Inventory Tracking (empty for now),
Price Estimator, Estimator Config, Change Password, Users.

## 1. Set up the Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. **SQL Editor** → paste and run each file in `supabase/migrations/`, in name order
   (schema, then function lock-down, then table grants).
   (Or with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
3. **Authentication → Sign In / Providers → Email**: keep Email enabled, turn **off** "Confirm email"
   and turn **off** "Allow new users to sign up" (only admins create users).
4. **Authentication → Users → Add user**: e-mail `rsayani@ve-internal.local`, a password,
   tick *Auto Confirm User*. Then run `supabase/first-admin.sql` in the SQL editor.
   That account can now sign in with username `rsayani` and create everyone else from the Users page.

## 2. Deploy the Edge Function

Needs the [Supabase CLI](https://supabase.com/docs/guides/cli), run from the repo root:

```powershell
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy admin-users
```

The function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which Supabase provides
automatically. The service key never reaches the browser.

## 3. Run locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```powershell
copy .env.example .env.local   # then fill in the URL and anon key from Project Settings > API
npm install
npm run dev
```

`npm test` runs the price estimator tests; `npm run build` writes the site to `dist/`.

## 4. Put it online

Any static host works. On **Vercel**: import the repo, framework *Vite*, and add the two
`VITE_SUPABASE_…` environment variables. `vercel.json` already sends every route to
`index.html`. (Netlify uses `public/_redirects` the same way.)

## Data from the old Java/MySQL version

The old Spring Boot app was removed from this repo (it is still in Git history before this
change). Its data maps onto this schema with these differences:

- `intake_form.created_on` → `timestamptz`; `created_by_user_id` is now the Supabase user's UUID.
- `lens_recommendation` columns are merged into `prescriptions` (one refraction per intake form).
- `optical_store_config` keeps its child lists as JSON columns on the single config row.
- Users must be re-created in Supabase Auth. Existing BCrypt hashes (`$2a$`/`$2y$`) can be
  imported into `auth.users.encrypted_password` so people keep their passwords.

## Security notes

- Every table has row level security, and the API roles get only the table access the
  policies need. The anon key alone can read nothing; a signed-in user only sees and changes
  what their role/permissions allow.
- Deactivating a user bans their Supabase Auth account, so they cannot sign in or refresh a session.
- The `users` permission can't be granted from the Users page; give it with SQL if needed.
