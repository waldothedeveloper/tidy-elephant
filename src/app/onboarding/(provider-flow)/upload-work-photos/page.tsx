"use client";

import { ArrowLeft, Loader2Icon, Upload, X } from "lucide-react";
import {
  finalizeWorkPhotosAction,
  uploadSingleWorkPhotoAction,
} from "@/app/actions/onboarding/upload-work-photos-action";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SELECT_LOCATION = "/onboarding/select-location";

export default function ProviderOnboardingUploadWorkPhotos() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleFileUpload = useCallback(
    (files: FileList) => {
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        if (
          file.type.startsWith("image/") &&
          selectedFiles.length + validFiles.length < 8
        ) {
          validFiles.push(file);
          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          newPreviews.push(previewUrl);
        }
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    },
    [selectedFiles.length]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const removePhoto = useCallback(
    (index: number) => {
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(previewUrls[index]);

      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [previewUrls]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFileUpload(e.target.files);
      }
    },
    [handleFileUpload]
  );

  const handleSubmit = useCallback(async () => {
    if (selectedFiles.length < 3) {
      toast.error("Please select at least 3 photos");
      return;
    }

    const successMessage = "Work photos uploaded successfully!";

    const submitPromise = (async () => {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const singleFileFormData = new FormData();
        singleFileFormData.append("photo", file);

        const uploadResult = await uploadSingleWorkPhotoAction(
          singleFileFormData
        );

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(
            uploadResult.message || "Failed to upload one of the photos"
          );
        }

        uploadedUrls.push(uploadResult.url);
      }

      const saveResult = await finalizeWorkPhotosAction({ urls: uploadedUrls });

      if (!saveResult.success) {
        throw new Error(
          saveResult.message || "Failed to save uploaded work photos"
        );
      }

      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);

      return { message: successMessage };
    })();

    toast.promise(submitPromise, {
      loading: "Uploading your work photos...",
      success: () => successMessage,
      error: (error) => `Upload failed: ${error.message}`,
    });

    startTransition(async () => {
      try {
        await submitPromise;
        router.push(SELECT_LOCATION);
      } catch {
        // Errors are handled via toast notifications
      }
    });
  }, [previewUrls, router, selectedFiles, startTransition]);

  const hasMinimumPhotos = selectedFiles.length >= 3;
  const canAddMore = selectedFiles.length < 8;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex items-center justify-between gap-x-6">
          <Button asChild type="button" variant="outline">
            <Link href="/onboarding/hourly-rate">
              <ArrowLeft className="size-4 mr-2" />
              Previous
            </Link>
          </Button>
          <div className="flex items-center gap-x-4">
            <Button
              className="max-w-md w-full"
              variant={!hasMinimumPhotos ? "outline" : "default"}
              disabled={!hasMinimumPhotos || isPending}
              onClick={handleSubmit}
            >
              {isPending && <Loader2Icon className="animate-spin mr-2" />}
              {isPending
                ? "Uploading..."
                : "Upload photos & continue onboarding"}
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
            Upload Work Photos
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-foreground">
            Showcase your work by uploading 3-8 photos of your organizing
            projects. High-quality before/after photos help clients see your
            expertise.
          </p>
        </div>

        <div className="space-y-12 max-w-4xl">
          <div className="pb-12">
            <div className="mt-10 space-y-6">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  !canAddMore || isPending
                    ? "border-muted-foreground/10 bg-muted/20"
                    : isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={
                  canAddMore && !isPending ? handleDragOver : undefined
                }
                onDragLeave={
                  canAddMore && !isPending ? handleDragLeave : undefined
                }
                onDrop={canAddMore && !isPending ? handleDrop : undefined}
              >
                <div className="space-y-2">
                  <Upload
                    className={`mx-auto size-12 ${
                      canAddMore && !isPending
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  />
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-medium ${
                        canAddMore && !isPending
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {isPending ? (
                        "Uploading photos..."
                      ) : canAddMore ? (
                        <>
                          Drop your photos here, or{" "}
                          <label className="text-primary cursor-pointer hover:underline">
                            browse files
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleFileInput}
                              disabled={isPending || !canAddMore}
                              className="sr-only"
                            />
                          </label>
                        </>
                      ) : (
                        "Maximum 8 photos reached"
                      )}
                    </p>
                    <p
                      className={`text-xs ${
                        canAddMore && !isPending
                          ? "text-destructive"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {isPending
                        ? "Please wait while photos are being uploaded"
                        : canAddMore
                        ? "PNG, JPG, WEBP up to 4.5MB each"
                        : "Remove a photo to add more"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Grid with Placeholders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">
                    Gallery Preview ({selectedFiles.length}/8)
                  </h3>
                  {!hasMinimumPhotos && (
                    <p className="text-xs text-muted-foreground">
                      {3 - selectedFiles.length} more needed
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Uploaded Photos */}
                  {previewUrls.map((previewUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-border">
                        <Image
                          src={previewUrl}
                          alt={`Work photo ${index + 1}`}
                          width={200}
                          height={200}
                          className="size-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-background opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        disabled={isPending}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}

                  {/* Empty Placeholders */}
                  {Array.from({
                    length: 8 - selectedFiles.length,
                  }).map((_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="aspect-square rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center"
                    >
                      <span className="text-sm text-muted-foreground">
                        Photo {selectedFiles.length + index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
