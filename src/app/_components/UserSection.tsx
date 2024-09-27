"use client";

import { signOut, useSession } from "next-auth/react";

export default function UserSection() {
  const { data: session } = useSession();

  return (
    <div className="p-4 border-t border-gray-200">
      {session?.user?.email && (
        <p className="text-sm text-gray-600 mb-2">{session.user.email}</p>
      )}
      <button
        onClick={() => signOut()}
        className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition duration-300 ease-in-out"
      >
        Sign Out
      </button>
    </div>
  );
}
