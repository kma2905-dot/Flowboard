# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Supabase Setup

Flowboard stores its cards in a Supabase Postgres database instead of localStorage.

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. In the SQL editor, create the `cards` table:

   ```sql
   create table public.cards (
     id uuid primary key default gen_random_uuid(),
     title text not null,
     assignee text not null default '',
     priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
     due_date date,
     status text not null default 'backlog' check (status in ('backlog', 'in-progress', 'in-review', 'done')),
     created_at timestamptz not null default now()
   );

   alter table public.cards enable row level security;

   create policy "public can read cards" on public.cards for select to anon using (true);
   create policy "public can insert cards" on public.cards for insert to anon with check (true);
   create policy "public can update cards" on public.cards for update to anon using (true) with check (true);
   create policy "public can delete cards" on public.cards for delete to anon using (true);
   ```

3. In Project Settings → API, copy the **Project URL** and **publishable (anon) key**.
4. Create a `.env` file in the project root (this file is gitignored):

   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

5. Run `npm install && npm run dev`.

> **Note:** The RLS policies above allow anyone with the publishable key — which ships in the client bundle — to read and write all cards. That's fine for this no-auth course project, but if you add user accounts, scope the policies to the authenticated user instead.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
