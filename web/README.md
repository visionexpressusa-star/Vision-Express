# Vision Express internal portal — cloud version

The same app as the Spring Boot `ve-internal` jar, rebuilt as a **Vite + React (JavaScript)**
single-page app on **Supabase** (Postgres database, login, and one Edge Function).
It needs no server of its own: host the built files anywhere static (Vercel, Netlify,
Cloudflare Pages) and point them at your Supabase project.

| Spring Boot piece | Cloud version |
| --- | --- |
| MySQL + Flyway migrations | `supabase/migrations/…_initial_schema.sql` (Postgres) |
| Spring Security login, BCrypt users | Supabase Auth (username is mapped to `<username>@ve-internal.local`) |
| Role / permission checks on URLs | Row level security in the database + the same checks in the UI |
| Users admin (create, edit, activate) | `supabase/functions/admin-users` Edge Function |
| Thymeleaf pages + `admin.css` | React pages in `src/pages`, same `admin.css` and look |
| OpenPDF intake form PDF | Generated in the browser with jsPDF (`src/lib/pdf.js`) |
| `OpticalEstimateService` | `src/lib/estimate.js` (with tests) |

Pages: Dashboard, Intake Forms (list / create / edit own / view / PDF), Refraction,
Referral Source report (monthly pie, yearly bars), Inventory Tracking (empty, as before),
Price Estimator, Estimator Config, Change Password, Users.

## 1. Create the Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. **SQL Editor** → paste and run `supabase/migrations/20261126000000_initial_schema.sql`.
   (Or with the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
3. **Authentication → Sign In / Providers → Email**: keep Email enabled, turn **off** "Confirm email"
   and turn **off** "Allow new users to sign up" (only admins create users).
4. **Authentication → Users → Add user**: e-mail `rsayani@ve-internal.local`, a password,
   tick *Auto Confirm User*. Then run `supabase/first-admin.sql` in the SQL editor.
   That account can now sign in with username `rsayani` and create everyone else from the Users page.

## 2. Deploy the Edge Function

Needs the [Supabase CLI](https://supabase.com/docs/guides/cli):

```powershell
cd web
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy admin-users
```

The function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, which Supabase provides
automatically. The service key never reaches the browser.

## 3. Run locally

Needs [Node.js](https://nodejs.org) 20 or newer.

```powershell
cd web
copy .env.example .env.local   # then fill in the URL and anon key from Project Settings > API
npm install
npm run dev
```

`npm test` runs the price estimator tests; `npm run build` writes the site to `dist/`.

## 4. Put it online

Any static host works. On **Vercel**: import the repo, set *Root Directory* to `web`,
framework *Vite*, and add the two `VITE_SUPABASE_…` environment variables. `vercel.json`
already sends every route to `index.html`. (Netlify uses `public/_redirects` the same way.)

## Moving existing data from MySQL

The schema keeps the old column names, with these differences:

- `intake_form.created_on` → `timestamptz`; `created_by_user_id` is now the Supabase user's UUID.
- `lens_recommendation` columns are merged into `prescriptions` (one refraction per intake form).
- `optical_store_config` keeps its child lists as JSON columns on the single config row.
- Users must be re-created in Supabase Auth. Existing BCrypt hashes (`$2a$`/`$2y$`) can be
  imported into `auth.users.encrypted_password` so people keep their passwords.

## Security notes

- Every table has row level security. The anon key alone can read nothing; a signed-in user
  only sees and changes what their role/permissions allow, matching the old URL rules.
- Deactivating a user bans their Supabase Auth account, so they cannot sign in or refresh a session.
- The `users` permission can't be granted from the Users page (same rule as before); give it
  with SQL if needed.
