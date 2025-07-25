"use client";

import { Camera, Loader2Icon, Upload, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { firebaseSaveProviderWorkPhotosAction } from "@/app/actions/onboarding/firebase-save-provider-work-photos-action";
import { storage } from "@/lib/firebase/clientApp";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/app/onboarding/_hooks/use-firebase-client-auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { workPhotosSchema } from "@/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ProviderOnboardingUploadWorkPhotos() {
  const { authError, isAuthenticated } = useFirebaseAuth();
  const [isPending, startTransition] = useTransition();

  const [uploadingPhotos, setUploadingPhotos] = useState<Set<number>>(
    new Set()
  );

  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {}
  );

  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof workPhotosSchema>>({
    resolver: zodResolver(workPhotosSchema),
    defaultValues: {
      workPhotos: [],
    },
  });

  const { isDirty, isValid } = form.formState;
  const workPhotos = form.watch("workPhotos");

  async function onSubmit(values: z.infer<typeof workPhotosSchema>) {
    const successMessage = "Work photos saved successfully!";

    const submitPromise = firebaseSaveProviderWorkPhotosAction(values).then(
      async (result) => {
        // Check if the save operation was successful
        if (!result.success) {
          throw new Error(result.error);
        }

        await user?.reload();
        router.push("/onboarding/create-schedule");
        return { message: successMessage };
      }
    );

    toast.promise(submitPromise, {
      loading: "Saving your work photos...",
      success: () => successMessage,
      error: (error) => `Failed to save work photos: ${error.message}`,
    });

    startTransition(async () => {
      await submitPromise;
    });
  }

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const currentPhotos = form.getValues("workPhotos");
      if (currentPhotos.length + files.length > 8) {
        toast.error("Maximum 8 photos allowed", {
          description: "You can upload up to 8 work photos total.",
        });
        event.target.value = "";
        return;
      }

      const acceptedTypes = ["image/jpeg", "image/jpg", "image/webp"];
      const acceptedExtensions = [".jpg", ".jpeg", ".webp"];

      for (const file of files) {
        const isValidType = acceptedTypes.includes(file.type);
        const isValidExtension = acceptedExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );

        if (!isValidType || !isValidExtension) {
          toast.error("Unsupported file format", {
            description: "Please upload JPG, JPEG or WebP images only",
          });
          event.target.value = "";
          return;
        }
      }

      if (isAuthenticated) {
        const uploadPromises = files.map(async (file, index) => {
          const photoIndex = currentPhotos.length + index;

          setUploadingPhotos((prev) => new Set([...prev, photoIndex]));

          return new Promise<string>((resolve, reject) => {
            try {
              const contentType = file.type || "image/jpeg";
              const timestamp = Date.now();
              const storageRef = ref(
                storage,
                `profile-photos/${user?.id}/work-photos/${timestamp}-${file.name}`
              );
              const uploadTask = uploadBytesResumable(storageRef, file, {
                contentType,
              });

              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setUploadProgress((prev) => ({
                    ...prev,
                    [photoIndex]: Math.round(progress),
                  }));
                },
                (error) => {
                  let errorMessage =
                    "An unknown error occurred while uploading";
                  switch (error.code) {
                    case "storage/unauthorized":
                      errorMessage =
                        "You don't have permission to upload files";
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
                      resolve(downloadURL);
                    })
                    .catch(reject);
                }
              );
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : "An unknown error occurred trying to upload photo";
              reject(new Error(errorMessage));
            }
          });
        });

        Promise.all(uploadPromises)
          .then((downloadURLs) => {
            const newPhotos = [...currentPhotos, ...downloadURLs];
            form.setValue("workPhotos", newPhotos, {
              shouldValidate: true,
              shouldDirty: true,
            });
            event.target.value = "";

            // Clear upload states
            setUploadingPhotos(new Set());
            setUploadProgress({});

            toast.success(
              `${files.length} photo${files.length > 1 ? "s" : ""} uploaded successfully!`
            );
          })
          .catch((error) => {
            // Clear upload states on error
            setUploadingPhotos(new Set());
            setUploadProgress({});
            event.target.value = "";
            toast.error(`Upload failed: ${error.message}`);
          });
      }
    },
    [form, user?.id, isAuthenticated]
  );

  const removePhoto = useCallback(
    async (index: number) => {
      const currentPhotos = form.getValues("workPhotos");
      const photoToRemove = currentPhotos[index];

      if (!photoToRemove) return;

      try {
        // Extract the file path from the Firebase Storage URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/PROJECT_ID/o/PATH?alt=media&token=TOKEN
        const url = new URL(photoToRemove);
        const pathMatch = url.pathname.match(/\/o\/(.+)/);

        if (pathMatch) {
          // Decode the URL-encoded path
          const filePath = decodeURIComponent(pathMatch[1]);

          // Create reference to the file in Firebase Storage
          const fileRef = ref(storage, filePath);

          // Delete the file from Firebase Storage
          await deleteObject(fileRef);
        }

        // Remove from form state
        const newPhotos = currentPhotos.filter((_, i) => i !== index);
        form.setValue("workPhotos", newPhotos, {
          shouldValidate: true,
          shouldDirty: true,
        });

        toast.success("Photo removed successfully!");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Still remove from form state even if Firebase deletion fails
        const newPhotos = currentPhotos.filter((_, i) => i !== index);
        form.setValue("workPhotos", newPhotos, {
          shouldValidate: true,
          shouldDirty: true,
        });

        toast.error(
          "Something went wrong trying to remove the photo. The file may still exist in storage",
          {
            description: "Please contact support if this persists.",
          }
        );
      }
    },
    [form]
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
              variant={!isDirty || !isValid ? "outline" : "default"}
              disabled={
                isPending || !isDirty || !isValid || uploadingPhotos.size > 0
              }
              type="submit"
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              Submit & Finish
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            <div className="border-b border-border pb-12">
              <h2 className="text-base/7 font-semibold text-foreground">
                Work Gallery{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({workPhotos.length}/8 photos)
                </span>
              </h2>
              <p className="mt-1 text-sm/6 text-muted-foreground max-w-sm">
                Upload 3 to 8 high-quality photos (JPG, JPEG, or WebP) that
                highlight your organizing skills and style. These images help
                potential clients visualize your expertise.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="col-span-full">
                  <FormField
                    control={form.control}
                    name="workPhotos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Photos</FormLabel>
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
                          <div className="text-center">
                            <Camera
                              aria-hidden="true"
                              className="mx-auto size-12 text-muted-foreground"
                            />
                            <div className="mt-4 flex text-sm/6 text-muted-foreground">
                              <label
                                htmlFor="work-photos-upload"
                                className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                              >
                                <span>Upload photos</span>
                                <Input
                                  id="work-photos-upload"
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/webp"
                                  multiple
                                  onChange={handleFileChange}
                                  disabled={
                                    uploadingPhotos.size > 0 ||
                                    workPhotos.length >= 8
                                  }
                                  className="sr-only"
                                />
                              </label>

                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs/5 text-muted-foreground">
                              JPG, JPEG, WebP up to 10MB each
                            </p>
                            <FormControl>
                              {/* Hidden input to store the actual form value */}
                              <input type="hidden" {...field} />
                            </FormControl>
                            {workPhotos.length >= 8 && (
                              <p className="text-xs/5 text-destructive mt-1">
                                Maximum 8 photos reached
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {uploadingPhotos.size > 0 && (
                          <div className="mt-4 space-y-2">
                            {Array.from(uploadingPhotos).map((photoIndex) => (
                              <div
                                key={photoIndex}
                                className="flex items-center gap-2"
                              >
                                <Upload className="size-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Uploading photo {photoIndex + 1}...{" "}
                                  {uploadProgress[photoIndex] || 0}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Gallery Preview */}
                {workPhotos.length > 0 && (
                  <div className="col-span-full">
                    <h3 className="text-sm font-medium text-foreground mb-4">
                      Gallery Preview
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {workPhotos.map((photoUrl, index) => (
                        <div key={photoUrl} className="relative group">
                          <div className="aspect-square relative overflow-hidden rounded-lg border border-border">
                            <Image
                              src={photoUrl}
                              alt={`Work photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Empty placeholders to show remaining slots */}
                      {Array.from({
                        length: Math.min(8 - workPhotos.length, 4),
                      }).map((_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="aspect-square rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center"
                        >
                          <span className="text-sm text-muted-foreground">
                            Photo {workPhotos.length + index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
