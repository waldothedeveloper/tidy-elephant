import { Camera, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const categories = [
  "Core Professional Organizers",
  "Home Stagers",
  "Feng Shui Consultants",
  "Move Managers and Downsizing Specialists",
  "Interior Designers",
  "Office organizers",
  "Home organizers",
  "Paperwork/document organizers",
  "Digital organizers",
  "Time & Productivity Coaches",
  "Estate Cleanout / Hoarding Specialists",
];

export default function ProviderOnboardingProfile() {
  return (
    <div>
      <div className="pb-12">
        <h2 className="text-3xl font-semibold text-foreground">
          Create Profile
        </h2>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          This profile will be visible to clients looking for organizing
          services. Please fill out your details accurately to help clients find
          the right organizer for their needs.
        </p>
      </div>
      <form>
        <div className="space-y-12">
          <div className="border-b border-border pb-12">
            <h2 className="text-base/7 font-semibold text-foreground">
              Basic Info
            </h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">
              Provide your name, a brief bio, and a profile photo to introduce
              yourself to potential clients.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="first-name">First name</Label>
                <div className="mt-2">
                  <Input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="last-name">Last name</Label>
                <div className="mt-2">
                  <Input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <Label htmlFor="about">About me</Label>
                <div className="mt-2">
                  <Textarea
                    id="about"
                    name="about"
                    rows={4}
                    placeholder="Tell potential clients about yourself, your experience, and your organizing philosophy..."
                  />
                </div>
              </div>

              <div className="col-span-full">
                <Label htmlFor="photo">Profile Photo</Label>
                <div className="mt-2 flex items-center gap-x-3">
                  <UserRoundPlus
                    aria-hidden="true"
                    className="size-12 text-foreground/30"
                  />
                  <Button variant="outline" type="button">
                    Change
                  </Button>
                </div>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                <div className="mt-2">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-muted-foreground sm:text-sm">
                        $
                      </span>
                    </div>
                    <Input
                      id="hourly-rate"
                      name="hourly-rate"
                      type="number"
                      placeholder="75"
                      min="1"
                      step="1"
                      className="pl-8"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your standard hourly rate for organizing services.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border pb-12">
            <h2 className="text-base/7 font-semibold text-foreground">
              Specializations
            </h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">
              Select all the categories you specialize in. This helps clients
              find the right organizer for their needs.
            </p>

            <div className="mt-10 space-y-10">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-foreground">
                  Areas of Expertise
                </legend>
                <div className="mt-6 space-y-6">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${index}`}
                        name="categories"
                        value={category}
                      />
                      <Label
                        htmlFor={`category-${index}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="border-b border-border pb-12">
            <h2 className="text-base/7 font-semibold text-foreground">
              Work Gallery{" "}
              <span className="text-muted-foreground font-normal text-sm">
                (recommended)
              </span>
            </h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">
              Upload photos of your organizing work to showcase your skills and
              style.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <Label htmlFor="work-photos">Work Photos</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
                  <div className="text-center">
                    <Camera
                      aria-hidden="true"
                      className="mx-auto size-12 text-muted-foreground"
                    />
                    <div className="mt-4 flex text-sm/6 text-muted-foreground">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                      >
                        <span>Upload photos</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs/5 text-muted-foreground">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery Preview */}
              <div className="col-span-full">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      Photo 1
                    </span>
                  </div>
                  <div className="aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      Photo 2
                    </span>
                  </div>
                  <div className="aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      Photo 3
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </div>
  );
}
