import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function HeroPage() {
  return (
    <div className="bg-background">
      <div className="relative isolate py-12">
        <div className="w-full mx-auto lg:max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="my-5 sm:flex justify-center">
              <Badge
                className="h-5 min-w-5 rounded-full px-1 tabular-nums font-mono text-xs p-3"
                variant="outline"
              >
                🚀 Coming soon...
              </Badge>
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-8xl">
              Love your home again
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-foreground sm:text-xl/8">
              Local experts who turn overwhelming spaces into peaceful,
              organized sanctuaries.
            </p>
          </div>
          <div className="mt-16 sm:mt-24">
            <Image
              alt="App screenshot"
              src="https://images.unsplash.com/photo-1714647212106-c649ee06a117?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={2432}
              height={1442}
            />
            <div className="text-xs text-muted-foreground mt-2">
              Photo by{" "}
              <a href="https://unsplash.com/@silverkblack?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Vitaly Gariev
              </a>{" "}
              on{" "}
              <a href="https://unsplash.com/photos/a-couple-of-people-laying-on-a-rug-in-a-room-iP-724D21CY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Unsplash
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
