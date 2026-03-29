import { Suspense, useState } from "react";
import { useSession } from "../lib/auth-client";
import { trpc } from "../lib/trpc";

export function meta() {
  return [{ title: "Notes \u2014 ERH App" }];
}

function NotesList() {
  const utils = trpc.useUtils();
  const { data: notes = [] } = trpc.notes.list.useQuery();

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });

  if (notes.length === 0) {
    return <p className="text-gray-400 text-sm">No notes yet. Create one above.</p>;
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
              {note.body && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                  {note.body}
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteMutation.mutate({ id: note.id })}
              disabled={deleteMutation.isPending}
              className="text-xs text-red-500 hover:text-red-700 shrink-0 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CreateNoteForm() {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setBody("");
      utils.notes.list.invalidate();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), body: body.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm mb-6"
    >
      <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">New note</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Body (optional)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !title.trim()}
          className="bg-blue-600 text-white rounded-md py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? "Saving..." : "Add note"}
        </button>
      </div>
      {createMutation.error && (
        <p className="text-xs text-red-500 mt-2">{createMutation.error.message}</p>
      )}
    </form>
  );
}

export default function NotesPage() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (!session) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <p className="text-gray-500 dark:text-gray-400">
          Please{" "}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            sign in
          </a>{" "}
          to view your notes.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{session.user.email}</span>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            Home
          </a>
        </div>
      </div>
      <CreateNoteForm />
      <Suspense fallback={<p className="text-gray-400 text-sm">Loading notes...</p>}>
        <NotesList />
      </Suspense>
    </main>
  );
}
