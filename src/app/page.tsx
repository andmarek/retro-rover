"use client";

import Link from "next/link";
import { Button, Heading, Text } from "@radix-ui/themes";
import { useSession } from "@/lib/auth-client";

function Hero() {
  const { data: session } = useSession();

  return (
    <main className="z-100 flex min-h-screen flex-col items-center justify-between section-before relative overflow-hidden p-32">
        <div className="flex flex-col text-center justify-center">
          <Heading className="max-w-4xl my-2" align="center" weight="bold" size="9"> Sprint Retrospectives Made Easy, Effective, and Enjoyable </Heading>
          <Text className="max-w-2xl pt-2 self-center" as="p" align="center" size="6"> Unlock seamless team growth with our free, secure, and simple retrospective boards - simplicity in every reflection</Text>
          <div className="my-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button className="z-100" size="3" asChild>
              <Link href={session?.user ? "/boards" : "/sign-in?mode=signup"}>
                {session?.user ? "Go to My Boards" : "Sign Up Free"}
              </Link>
            </Button>
            <Button className="z-100" size="3" variant="outline" asChild>
              <Link href={session?.user ? "/boards/new" : "/sign-in"}>
                {session?.user ? "Create a Board" : "Sign In"}
              </Link>
            </Button>
          </div>
        </div>
      </main>
  )
}
export default function Home() {
  return (
    <div>
      <Hero />
    </div>
  );
}
