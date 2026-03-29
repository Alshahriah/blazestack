import { notes } from "@blazestack/db";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router, z } from "../trpc";
import { createId } from "../utils";

export const notesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(notes)
      .where(eq(notes.userId, ctx.session.userId))
      .orderBy(desc(notes.createdAt));
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        body: z.string().max(2000).default(""),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [note] = await ctx.db
        .insert(notes)
        .values({
          id: createId(),
          userId: ctx.session.userId,
          title: input.title,
          body: input.body,
        })
        .returning();
      if (!note)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create note" });
      return note;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(notes)
        .where(and(eq(notes.id, input.id), eq(notes.userId, ctx.session.userId)));
      return { id: input.id };
    }),
});
