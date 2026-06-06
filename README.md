# Daily Learning App

Hebrew daily learning app — ~5-minute AI-generated lessons with personalization.

## Local development

```sh
npm install
cp .env.example .env
# Fill in API keys in .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role (for registration) |
| `UNSPLASH_ACCESS_KEY` | No | Lesson images; falls back to placeholder |

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/fix_permissions.sql` if you get permission errors
4. Run `supabase/add_youtube_query.sql` for YouTube links on new lessons
5. In **Authentication → Providers → Email**, disable **Confirm email**

## Deploy to Vercel (free, always on)

Deploy once and open the app from your phone anytime — no Mac running, no same WiFi.

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. In **Environment Variables**, add all variables from `.env.example` with your real values
4. Deploy — you get a URL like `https://your-app.vercel.app`
5. Open that URL on your phone and register with username + password

### Notes

- Accounts created before password auth used a hidden auto-password. Register a new account (or delete old users in Supabase **Authentication → Users**).
- Gemini and Supabase free tiers are enough for personal daily use.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run dev:mobile` | Dev server on LAN (`--host`) |
| `npm run build` | Production build |
| `npm run check` | Type check |
