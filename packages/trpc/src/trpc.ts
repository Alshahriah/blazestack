import type { DB } from "@blazestack/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";

export type Session = {
  userId: string;
  email: string;
};

export type Context = {
  db: DB;
  session: Session | null;
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Surface Zod validation errors in a structured way
        zodError:
          error.cause instanceof Error && error.cause.name === "ZodError"
            ? JSON.parse(error.cause.message)
            : null,
      },
    };
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const middleware = t.middleware;
export { z };
