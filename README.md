# AskIt

AskIt is a community question-and-discussion app built with Next.js, Supabase, and Tailwind CSS.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and public anon key.
2. Run the SQL files in `supabase/migrations` in numeric order in the Supabase SQL editor.
3. Enable Google under **Authentication > Providers** in Supabase.
4. Add `http://localhost:3000/auth/callback` and the production equivalent under **Authentication > URL Configuration > Redirect URLs**.
5. Install and run the app:

   ```bash
   npm install
   npm run dev
   ```

Do not deploy the new client before applying the migration. Legacy posts are intentionally preserved as read-only when they cannot be mapped safely to an `auth.users` UUID.

## Verification

```bash
npm run build
npm audit
```

The migration replaces the former anonymous write policies with owner-based RLS, creates the feed/search aggregate functions, configures the image bucket, and installs profile and notification support.

## Main capabilities

- Google login through Supabase Auth
- Owner-enforced posts, comments, and votes through PostgreSQL RLS
- Paginated feeds with newest and top sorting
- Parameterized search across titles and categories
- Markdown posts with raw HTML disabled
- JPEG, PNG, and WebP uploads with per-user Storage policies
- User profiles, in-app comment notifications, dark mode, and mobile authentication controls
