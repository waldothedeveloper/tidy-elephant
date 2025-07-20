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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { firebaseCreateProviderProfileAction } from "@/app/actions/onboarding/firebase-create-provider-profile-action";
import { storage } from "@/lib/firebase/clientApp";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/app/onboarding/_hooks/use-firebase-client-auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { userProfileSchema } from "@/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// TODO: Maybe add a character counter for the about section
export default function ProviderOnboardingBasicInfo() {
  const { authError, isAuthenticated } = useFirebaseAuth();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      about: "",
      photo: "",
    },
  });

  const { isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof userProfileSchema>) {
    const successMessage = "Profile created successfully!";

    const submitPromise = firebaseCreateProviderProfileAction(values).then(
      async (result) => {
        // Check profile creation result
        if (!result.success) {
          throw new Error(result.error);
        }

        await user?.reload();
        router.push("/onboarding/verify-phone");
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

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      // Define accepted file types
      const acceptedTypes = ["image/jpeg", "image/jpg", "image/webp"];
      const acceptedExtensions = [".jpg", ".jpeg", ".webp"];

      // Check if file type is accepted
      const isValidType = acceptedTypes.includes(file.type);
      const isValidExtension = acceptedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isValidType || !isValidExtension) {
        toast.error("Unsupported file format", {
          description: "Please upload a JPG, JPEG or WebP image",
        });
        event.target.value = "";
        return;
      }

      setIsUploading(true);

      if (isAuthenticated) {
        const uploadPromise = new Promise<string>((resolve, reject) => {
          try {
            // Determine correct content type based on file
            const contentType = file.type || "image/jpeg";
            const formData = new FormData();
            formData.append("photo", file);

            const storageRef = ref(
              storage,
              `profile-photos/${user?.id}/${file.name}`
            );
            const uploadTask = uploadBytesResumable(storageRef, file, {
              contentType,
            });

            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                setUploadProgress(Math.round(progress));
              },
              (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                let errorMessage = "An unknown error occurred while uploading";
                switch (error.code) {
                  case "storage/unauthorized":
                    errorMessage = "You don't have permission to upload files";
                    break;
                  case "storage/canceled":
                    errorMessage = "File upload was canceled";
                    break;
                  case "storage/unknown":
                    errorMessage = `An unknown error occurred while uploading: ${error.serverResponse}`;
                    break;
                }
                reject(new Error(errorMessage));
              },
              () => {
                getDownloadURL(uploadTask.snapshot.ref)
                  .then((downloadURL) => {
                    form.setValue("photo", downloadURL);
                    resolve(downloadURL);
                  })
                  .catch(reject);
              }
            );
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "An unknown error occurred trying to update user metadata";
            reject(new Error(errorMessage));
          }
        });

        uploadPromise
          .then(() => {
            // Cleanup on success
            event.target.value = "";
            setIsUploading(false);
            setUploadProgress(0);
          })
          .catch(() => {
            // Cleanup on error
            event.target.value = "";
            setIsUploading(false);
            setUploadProgress(0);
          });

        toast.promise(uploadPromise, {
          loading: "Uploading your profile photo...",
          success: "Your profile photo uploaded successfully!",
          error: (error) => `Something went wrong: ${error.message}`,
        });
      }
    },
    [form, user?.id, isAuthenticated]
  );

  if (authError) {
    throw new Error(`Failed to sign in to Firebase: ${authError}`);
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
              disabled={isPending || !isDirty || isUploading}
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
              Activate Profile
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
                              {value && !isUploading ? (
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
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="max-w-[200px]"
                              />
                              <FormControl>
                                {/* Hidden input to store the actual form value */}
                                <input type="hidden" {...rest} />
                              </FormControl>

                              {isUploading && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Uploading photo {uploadProgress}% complete...
                                </p>
                              )}
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
