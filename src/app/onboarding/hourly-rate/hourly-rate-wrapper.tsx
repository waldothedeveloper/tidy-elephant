"use client";

import { ArrowLeft, DollarSign, Loader2Icon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { firebaseSaveProviderHourlyRateAction } from "@/app/actions/onboarding/firebase-save-provider-hourly-rate-action";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/app/onboarding/_hooks/use-firebase-client-auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { userHourlyRateInputSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

export function HourlyRateWrapper() {
  const { authError } = useFirebaseAuth();
  const [isPending, startTransition] = useTransition();

  const { user } = useUser();
  const router = useRouter();

  const form = useForm<{ hourlyRate: string }>({
    resolver: zodResolver(userHourlyRateInputSchema),
    defaultValues: {
      hourlyRate: "",
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = useCallback(
    async (values: { hourlyRate: string }) => {
      const successMessage = "Hourly rate saved successfully!";

      const submitPromise = firebaseSaveProviderHourlyRateAction(values).then(
        async (result) => {
          // Check hourly rate save result
          if (!result.success) {
            throw new Error(result.error);
          }

          await user?.reload();
          router.push("/onboarding/upload-work-photos");
          return { message: successMessage };
        }
      );

      toast.promise(submitPromise, {
        loading: "Saving your hourly rate...",
        success: () => successMessage,
        error: (error) => `Ouch! Something went wrong: ${error.message}`,
      });

      startTransition(async () => {
        await submitPromise;
      });
    },
    [user, router]
  );

  if (authError) {
    throw new Error(`Failed to sign in to Firebase: ${authError}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-between gap-x-6">
            <Button asChild type="button" variant="outline">
              <Link href="/onboarding/select-categories" type="button">
                <ArrowLeft className="size-4 mr-2" />
                Previous
              </Link>
            </Button>
            <div className="flex items-center gap-x-4">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <Button
                variant={!isDirty ? "outline" : "default"}
                disabled={isPending || !isDirty}
                type="submit"
              >
                {isPending && <Loader2Icon className="animate-spin" />}
                Save Rate & Continue
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-12">
            <span className="mt-2 text-sm text-muted-foreground">
              Create Profile
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Hourly Rate
              </div>
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-foreground">
              Set your hourly rate to help clients understand your pricing. You
              can always adjust this later in your profile settings.
            </p>
          </div>

          <div>
            <div className="space-y-12 max-w-4xl">
              <div className="border-b border-border pb-12">
                <div className="mt-10 max-w-md">
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="my-4">
                          Hourly Rate (USD)
                        </FormLabel>

                        <div className="relative max-w-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="size-4 text-muted-foreground" />
                          </div>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="75"
                              className="pl-10"
                              maxLength={3}
                              {...field}
                            />
                          </FormControl>
                        </div>

                        <FormDescription>
                          Choose your hourly rate ($25-$250). Most independent
                          organizers charge $75-125/hour depending on their
                          specialization. Start confidently - you can refine
                          your pricing anytime.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
