"use client";

import React from "react";
import Link from 'next/link';
import { useSession, signOut } from "@/lib/auth-client";

function NavLink(props: { linkText: string, href: string }) {
  return (
    <Link href={props.href} className="text-base-300 hover:text-base-100 hover:no-underline transition-all duration-300 text-2xl mr-2">
      {props.linkText}
    </Link>
  )
}

function UserMenu({ user }: { user: any }) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-base-300">Hello, {user.email}</span>
      <button 
        onClick={handleSignOut}
        className="text-base-300 hover:text-base-100 transition-all duration-300 text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}

export default function NavBar() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="px-5 flex justify-between items-center">
      <div className="m-6">
        <NavLink linkText="Retro Rover" href="/" />
      </div>
      <div className="flex flex-row space-x-4 m-2">
        {!isPending && (
          <>
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <NavLink linkText="Sign In" href="/sign-in" />
            )}
            <NavLink linkText="Home" href="/" />
            {session?.user && (
              <NavLink linkText="My Boards" href="/myBoards" />
            )}
            <NavLink linkText="Create" href="/create" />
          </>
        )}
      </div>
    </nav>
  );
};
