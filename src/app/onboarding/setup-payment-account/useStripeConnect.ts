import { useEffect, useState } from "react";

import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js";

export const useStripeConnect = (connectedAccountId: string) => {
  const [stripeConnectInstance, setStripeConnectInstance] =
    useState<StripeConnectInstance | null>(null);

  useEffect(() => {
    if (connectedAccountId) {
      const fetchClientSecret = async () => {
        const response = await fetch("/api/stripe/create-account-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: connectedAccountId,
          }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error("An error occurred: ", error);
        } else {
          const { client_secret: clientSecret } = await response.json();
          return clientSecret;
        }
      };

      setStripeConnectInstance(
        loadConnectAndInitialize({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
          fetchClientSecret,
          appearance: {
            overlays: "dialog",
            variables: {
              colorPrimary: "#ffffff",
            },
          },
        })
      );
    }
  }, [connectedAccountId]);

  return stripeConnectInstance;
};

export default useStripeConnect;
