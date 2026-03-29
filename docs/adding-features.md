# Adding Features

## Adding a tRPC procedure

1. Add to an existing router or create a new file in `packages/trpc/src/routers/`
2. Register in `packages/trpc/src/root.ts`
3. Use immediately in web and mobile — types flow automatically

```ts
// packages/trpc/src/routers/posts.ts
export const postsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.db.select().from(posts).where(eq(posts.userId, ctx.session.userId))
  ),
  create: protectedProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.db.insert(posts).values({ id: createId(), userId: ctx.session.userId, ...input }).returning()
    ),
});

// packages/trpc/src/root.ts
export const appRouter = router({
  notes: notesRouter,
  posts: postsRouter, // add here
});
```

## Adding a DB table

1. Create `packages/db/src/schema/posts.ts`
2. Export from `packages/db/src/schema/index.ts`
3. Run `bun db:generate` then `bun db:migrate`

## Adding a web route

1. Create `apps/web/app/routes/posts.tsx`
2. Register in `apps/web/app/routes.ts`:
```ts
route("posts", "routes/posts.tsx"),
```

## Adding a mobile screen

1. Create `apps/mobile/app/(tabs)/posts.tsx`
2. Add `<Tabs.Screen name="posts" ... />` in `apps/mobile/app/(tabs)/_layout.tsx`
3. Add icon mapping in `apps/mobile/components/ui/icon-symbol.tsx` if needed

## Adding a shared UI component

- Web: `packages/ui/src/web/my-component.tsx` + export from `packages/ui/src/web/index.ts`
- Native: `packages/ui/src/native/my-component.tsx` + export from `packages/ui/src/native/index.ts`

## Using tRPC in web

```ts
import { trpc } from "~/lib/trpc";

const { data: notes } = trpc.notes.list.useQuery();

const utils = trpc.useUtils();
const createNote = trpc.notes.create.useMutation({
  onSuccess: () => utils.notes.list.invalidate(),
});
createNote.mutate({ title: "Hello", body: "World" });
```

## Using tRPC in mobile

```ts
import { trpc } from "../lib/trpc";

// Identical API to web
const { data: notes } = trpc.notes.list.useQuery();
```
