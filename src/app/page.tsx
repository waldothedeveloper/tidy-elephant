import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Button>Click me</Button>
      <LoginLink>Sign in</LoginLink>
      <RegisterLink>Sign up</RegisterLink>
    </div>
  );
}
