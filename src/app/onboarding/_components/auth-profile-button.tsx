"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";

export const AuthProfileButton = () => {
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
};
