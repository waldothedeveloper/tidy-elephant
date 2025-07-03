import { SignedIn, UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="flex flex-col text-6xl font-bold text-foreground text-center items-center justify-center min-h-screen">
      DASHBOARD
      <div className="mt-8">
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
