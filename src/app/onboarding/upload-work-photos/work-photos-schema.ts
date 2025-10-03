import * as v from "valibot";

// Image file validation schema
export const imageFileSchema = v.pipe(
  v.file(),
  v.mimeType(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  v.maxSize(4.5 * 1024 * 1024, "File size must be less than 4.5MB")
);

// Work photos upload schema
const workPhotoUrlSchema = v.pipe(
  v.string(),
  v.url("Photo URL must be valid")
);

export const workPhotosUploadSchema = v.object({
  photos: v.pipe(
    v.array(imageFileSchema),
    v.minLength(3, "At least 3 photos are required"),
    v.maxLength(8, "Maximum 8 photos allowed")
  ),
});

export const workPhotoUrlsSchema = v.pipe(
  v.array(workPhotoUrlSchema),
  v.minLength(3, "At least 3 photo URLs are required"),
  v.maxLength(8, "Maximum 8 photo URLs allowed")
);

export type WorkPhotosUploadInput = v.InferInput<typeof workPhotosUploadSchema>;
