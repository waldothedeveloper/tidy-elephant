import { createStripeRefreshLinkAction } from "@/app/actions/onboarding/stripe/create-stripe-refresh-link-action";

import { RefreshStripeCard } from "./refresh-stripe-card";

export default function RefreshFromStripePage() {
  return (
    <div className="bg-background px-4 py-16 sm:px-6 lg:px-8 min-h-dvh">
      <div className="mx-auto max-w-2xl">
        <RefreshStripeCard onRequestLink={createStripeRefreshLinkAction} />
      </div>
    </div>
  );
}
