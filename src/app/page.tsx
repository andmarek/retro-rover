import { Button, Heading, Text } from "@radix-ui/themes";
function Hero() {
  return (
    <main className="z-100 flex min-h-screen flex-col items-center justify-between section-before relative overflow-hidden p-32">
        <div className="flex flex-col text-center justify-center">
          <Heading className="max-w-4xl my-2" align="center" weight="bold" size="9"> Sprint Retrospectives Made Easy, Effective, and Enjoyable </Heading>
          <Text className="max-w-2xl pt-2 self-center" as="p" align="center" size="6"> Unlock seamless team growth with our free, secure, and simple retrospective boards - simplicity in every reflection</Text>
          <form className="my-2" action="/create">
            <Button className="z-100" size="3"> Get Started </Button>
          </form>
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
