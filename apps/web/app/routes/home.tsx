import { useNavigate } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

export function meta() {
  return [{ title: "ERH App" }, { name: "description", content: "ERH monorepo app" }];
}

export default function Home() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  if (isPending) return null;

  async function handleSignOut() {
    await signOut();
    navigate("/sign-in");
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ERH App</h1>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{session.user.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <a href="/sign-in" className="text-sm text-blue-600 hover:underline">
            Sign in
          </a>
        )}
      </div>

      {session ? (
        <a
          href="/notes"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          My Notes →
        </a>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Sign in to get started.</p>
          <a
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
          >
            Sign in
          </a>
        </div>
      )}
    </main>
  );
}
