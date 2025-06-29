import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function Dashboard() {
  return (
    <div className="flex flex-col text-6xl font-bold text-black">
      DASHBOARD
      <LogoutLink>Log out</LogoutLink>
    </div>
  );
}
