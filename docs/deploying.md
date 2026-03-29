# Deploying

## API

```bash
# Set secrets (one-time)
wrangler secret put DATABASE_URL --cwd apps/api
wrangler secret put BETTER_AUTH_SECRET --cwd apps/api

# Update BETTER_AUTH_URL in apps/api/wrangler.toml to your Workers subdomain
bun build:api
# or directly:
bun run --cwd apps/api deploy
```

## Web

```bash
# Update API_URL in apps/web/wrangler.jsonc to your deployed API URL
bun build:web
# or directly:
bun run --cwd apps/web deploy
```

## Mobile

```bash
bun add -g eas-cli
cd apps/mobile
eas build --platform ios     # or android, or all
eas submit                   # submit to App Store / Play Store
```

Before building, update the API URLs in:
- `apps/mobile/lib/trpc.tsx`
- `apps/mobile/lib/auth-client.ts`

## Cloudflare Hyperdrive (recommended for production)

For PostgreSQL connection pooling on Cloudflare Workers:

1. Create a Hyperdrive config in the Cloudflare dashboard
2. Uncomment the `[[hyperdrive]]` block in `apps/api/wrangler.toml`
3. Pass `c.env.HYPERDRIVE.connectionString` to `createDb()` instead of `c.env.DATABASE_URL`

## CI/CD

No CI/CD workflow is included. To add GitHub Actions, create `.github/workflows/ci.yml`:

1. Run `bun install`
2. Run `bun lint`
3. Run `tsc --noEmit`
4. Deploy via `wrangler deploy` using a `CLOUDFLARE_API_TOKEN` secret
