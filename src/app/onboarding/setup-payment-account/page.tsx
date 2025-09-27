"use client";

import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";

import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
// import { getProviderInfo } from "@/app/actions/onboarding/stripe/get-provider-info-action";
import { useState } from "react";
import { useStripeConnect } from "./useStripeConnect";

export default function SetupPaymentAccountPage() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState("");
  console.log("connectedAccountId: ", connectedAccountId);
  const stripeConnectInstance = useStripeConnect(connectedAccountId);
  console.log("stripeConnectInstance: ", stripeConnectInstance);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="pb-12">
          <span className="mt-2 text-sm text-muted-foreground">
            Payment Setup
          </span>
          <h2 className="mt-2 text-3xl font-semibold text-foreground">
            {!connectedAccountId && "Set up your payment account"}
            {connectedAccountId &&
              !stripeConnectInstance &&
              "Complete your payment setup"}
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-foreground">
            {!connectedAccountId &&
              "Create a secure payment account to receive payments from your clients. This ensures fast and reliable transactions for your organizing services."}
          </p>
        </div>

        <div className="w-full">
          <div className="space-y-8">
            {!accountCreatePending && !connectedAccountId && (
              <div className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Get started with payments
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Set up your secure payment processing account to start
                  accepting payments from clients.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      setAccountCreatePending(true);
                      setError(false);

                      // const accountInfo = await getProviderInfo();
                      // if (!accountInfo.success) {
                      //   setError(true);
                      //   setAccountCreatePending(false);
                      //   return;
                      // }

                      // const seed = accountInfo.data.stripe;
                      // const res = await createStripeConnectAccount();
                      // console.log(
                      //   "response from createStripeConnectAccount: ",
                      //   res
                      // );

                      // if (res.success) {
                      //   setConnectedAccountId(res.data.accountId);
                      //   setAccountCreatePending(false);
                      // } else {
                      //   setError(true);
                      //   setAccountCreatePending(false);
                      // }
                    } catch {
                      setError(true);
                      setAccountCreatePending(false);
                    }
                  }}
                >
                  Create Payment Account
                </Button>
              </div>
            )}

            {stripeConnectInstance && (
              <div className="border border-border rounded-lg p-6">
                <ConnectComponentsProvider
                  connectInstance={stripeConnectInstance}
                >
                  <ConnectAccountOnboarding
                    onExit={() => setOnboardingExited(true)}
                  />
                </ConnectComponentsProvider>
              </div>
            )}

            {error && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">
                  Something went wrong! Please try again.
                </p>
              </div>
            )}

            {(connectedAccountId ||
              accountCreatePending ||
              onboardingExited) && (
              <div className="border border-border rounded-lg p-6 bg-muted/50">
                <h4 className="text-sm font-medium text-foreground mb-3">
                  Status Information
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {connectedAccountId && (
                    <p>
                      Connected account ID:{" "}
                      <code className="bg-muted px-1 rounded text-xs font-mono">
                        {connectedAccountId}
                      </code>
                    </p>
                  )}
                  {accountCreatePending && (
                    <div className="flex items-center gap-2">
                      <Loader2Icon className="size-4 animate-spin" />
                      <p>Creating your payment account...</p>
                    </div>
                  )}
                  {onboardingExited && <p>Payment account setup completed</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
