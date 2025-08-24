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
import { Loader2Icon, UserRound } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { InferInput } from "valibot";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProviderProfileAction } from "@/app/actions/onboarding/create-provider-profile-action";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { userProfileSchema } from "./profile-schema";
import { valibotResolver } from "@hookform/resolvers/valibot";

// TODO: Maybe add a character counter for the about section
export default function ProviderOnboardingBasicInfo() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<InferInput<typeof userProfileSchema>>({
    resolver: valibotResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      about: "",
      photo: "",
    },
  });

  const { isDirty } = form.formState;

  async function onSubmit(values: InferInput<typeof userProfileSchema>) {
    const successMessage = "Profile created successfully!";

    const submitPromise = createProviderProfileAction(values).then(
      async (result) => {
        // Check profile creation result
        if (!result.success) {
          throw new Error(result.error);
        }

        await user?.reload();
        router.push("/onboarding/select-categories");
        return { message: successMessage };
      }
    );

    toast.promise(submitPromise, {
      loading: "Creating your profile...",
      success: () => successMessage,
      error: (error) => `Ouch! Something went wrong: ${error.message}`,
    });

    startTransition(async () => {
      await submitPromise;
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Button
              variant={!isDirty ? "outline" : "default"}
              disabled={isPending || !isDirty}
              type="submit"
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              Submit & Next Step
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-12">
            <span className="mt-2 text-sm text-muted-foreground">
              Create Profile
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Basic Information
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-foreground">
              Provide your name, a brief bio, and a profile photo to introduce
              yourself to potential clients.
            </p>
          </div>
          <div>
            <div className="space-y-12 max-w-4xl">
              <div className="border-b border-border pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              autoComplete="given-name"
                              placeholder="John"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              autoComplete="family-name"
                              placeholder="Doe"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="about"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About me</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="e.g. I'm a professional organizer focused on helping clients declutter and create efficient spaces..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Use this area to highlight what makes you unique and
                            how you can help them.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field: { value, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Profile Photo</FormLabel>
                          <div className="mt-2 flex items-center gap-x-3">
                            <div>
                              {value ? (
                                <Image
                                  width={80}
                                  height={80}
                                  src={value}
                                  alt="Profile"
                                  className="mx-auto size-20 rounded-full object-cover"
                                />
                              ) : (
                                <div>
                                  <UserRound
                                    aria-hidden="true"
                                    className="mx-auto size-20 text-muted-foreground"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="relative">
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/webp"
                                // onChange={handleFileChange}
                                // disabled={isUploading}
                                className="max-w-[200px]"
                              />
                              <FormControl>
                                {/* Hidden input to store the actual form value */}
                                <input type="hidden" {...rest} />
                              </FormControl>
                            </div>
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
