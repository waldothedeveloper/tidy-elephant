"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2Icon, Package } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ServiceCategory } from "@/types/user";
import { firebaseSaveProviderCategoriesAction } from "@/app/actions/onboarding/firebase-save-provider-categories-action";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/app/onboarding/_hooks/use-firebase-client-auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { userCategoriesSchema } from "@/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function CategoriesWrapper({
  categories,
}: {
  categories: ServiceCategory[] | { success: boolean; error?: string };
}) {
  const { authError } = useFirebaseAuth();
  const [isPending, startTransition] = useTransition();

  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof userCategoriesSchema>>({
    resolver: zodResolver(userCategoriesSchema),
    defaultValues: {
      categories: [],
    },
  });

  const { isDirty } = form.formState;
  const selectedCategories = form.watch("categories");

  const onSubmit = useCallback(
    async (values: z.infer<typeof userCategoriesSchema>) => {
      const successMessage = "Categories saved successfully!";

      const submitPromise = firebaseSaveProviderCategoriesAction(values).then(
        async (result) => {
          // Check categories save result
          if (!result.success) {
            throw new Error(result.error);
          }

          await user?.reload();
          router.push("/onboarding/upload-work-photos");
          return { message: successMessage };
        }
      );

      toast.promise(submitPromise, {
        loading: "Saving your categories...",
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

  if (!Array.isArray(categories)) {
    throw new Error("Something went wrong trying to retrieve the categories");
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-between gap-x-6">
            <Button asChild type="button" variant="outline">
              <Link href="/onboarding/verify-phone" type="button">
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
                Save Categories & Continue
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
                <Package className="size-5" />
                Service Categories
              </div>
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-foreground">
              Choose the categories of services you want to offer. You can
              select multiple categories that match your expertise and
              interests.
            </p>
          </div>

          <div>
            <div className="space-y-12 max-w-4xl">
              <div className="border-b border-border pb-12">
                <div className="mt-10">
                  <FormField
                    control={form.control}
                    name="categories"
                    render={() => (
                      <FormItem>
                        <FormLabel className="my-4">
                          Service Categories
                        </FormLabel>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categories.map((category) => (
                            <FormField
                              key={category.id}
                              control={form.control}
                              name="categories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-muted/50 transition-colors"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          category.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                category.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== category.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {category.name}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground cursor-pointer">
                                        {category.description}
                                      </p>
                                    </div>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>

                        {selectedCategories.length > 0 && (
                          <div className="mt-6 p-4 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-2">
                              Selected Categories ({selectedCategories.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selectedCategories.map((categoryId) => {
                                const category = categories.find(
                                  (cat) => cat.id === categoryId
                                );
                                return category ? (
                                  <span
                                    key={categoryId}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground"
                                  >
                                    {category.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

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
