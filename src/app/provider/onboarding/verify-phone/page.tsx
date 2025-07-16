"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { error: "The phone number should be at least 10 digits long" })
    .max(15, { error: "The phone number should not exceed 15 digits" }),
});

export default function ProviderOnboardingVerifyPhone() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-between gap-x-6">
            <Link href="/provider/onboarding/basic-info" type="button">
              <Button variant="outline">Previous</Button>
            </Link>
            <Button type="submit">Next</Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32">
          <div className="pb-12">
            <h2 className="text-3xl font-semibold text-foreground">
              Verify Your Phone Number
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
              To ensure the security of your account, please verify your phone
              number. This will help us keep your account safe and allow you to
              receive important notifications.
            </p>
          </div>

          <div className="space-y-12">
            <div className="border-b border-border pb-12">
              <h2 className="text-base/7 font-semibold text-foreground">
                Phone Verification
              </h2>
              <p className="mt-1 text-sm/6 text-muted-foreground">
                Enter your phone number below to receive a verification code.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="mt-2"
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Please enter your phone number in the format +1 (555)
                          123-4567.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
                {/* Additional fields can be added here as needed */}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
