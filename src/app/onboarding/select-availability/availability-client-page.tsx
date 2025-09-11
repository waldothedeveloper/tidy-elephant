"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Loader2Icon, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignedIn, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InferInput } from "valibot";
import { Input } from "@/components/ui/input";
import { US_TIMEZONE_IDENTIFIERS } from "@/lib/utils";
import { availabilitySchema } from "./availability-schema";
import { saveAvailabilityAction } from "@/app/actions/onboarding/save-availability-action";
import { toast } from "sonner";
import { tzOffset } from "@date-fns/tz";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { valibotResolver } from "@hookform/resolvers/valibot";

type DayOfWeek = {
  id:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  label: string;
  shortLabel: string;
};

type PageData = {
  title: string;
  subtitle: string;
  description: string;
  timezoneLabel: string;
  timezonePlaceholder: string;
  saveButtonText: string;
};

type AvailabilityClientPageProps = {
  daysOfWeek: readonly DayOfWeek[];
  pageData: PageData;
};

export default function AvailabilityClientPage({
  daysOfWeek,
  pageData,
}: AvailabilityClientPageProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const getDetectedTimezone = (): (typeof US_TIMEZONE_IDENTIFIERS)[number] => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Validate that detected timezone is in our allowed US timezones
      if (
        US_TIMEZONE_IDENTIFIERS.includes(
          detectedTimezone as (typeof US_TIMEZONE_IDENTIFIERS)[number]
        )
      ) {
        return detectedTimezone as (typeof US_TIMEZONE_IDENTIFIERS)[number];
      }

      // Fallback to Eastern Time if detected timezone is not in our US list
      return "America/New_York";
    } catch {
      return "America/New_York";
    }
  };

  const getTimeZoneLabel = (timeZone: string, date = new Date()) => {
    try {
      const offsetMinutes = tzOffset(timeZone, date);
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetMins = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? "+" : "-";

      // Format as UTC±XX:XX
      const utcOffset = `UTC${sign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`;

      const nameParts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "longGeneric",
      }).formatToParts(date);

      const zoneName =
        nameParts.find((p) => p.type === "timeZoneName")?.value || timeZone;

      return `(${utcOffset}) - ${zoneName}`;
    } catch (error) {
      throw new Error(`Failed to get timezone label for ${timeZone}: ${error}`);
    }
  };

  const timezones = US_TIMEZONE_IDENTIFIERS.map((timeZone) => ({
    value: timeZone,
    label: getTimeZoneLabel(timeZone),
  }));

  const form = useForm<InferInput<typeof availabilitySchema>>({
    resolver: valibotResolver(availabilitySchema),
    defaultValues: {
      timezone: getDetectedTimezone(),
      monday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      tuesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      wednesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      thursday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      friday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      saturday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
      sunday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    },
  });

  const { isDirty } = form.formState;

  async function onSubmit(values: InferInput<typeof availabilitySchema>) {
    startTransition(async () => {
      try {
        const result = await saveAvailabilityAction(values);

        if (result.success) {
          toast.success(result.message || "Availability saved successfully!");
          router.push(`/onboarding/background-check`);
        } else {
          toast.error(
            result.error || "Failed to save availability. Please try again."
          );
        }
      } catch (error) {
        console.error("Error submitting availability:", error);
        toast.error("Failed to save availability. Please try again.");
      }
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
              {pageData.saveButtonText}
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-12">
            <span className="mt-2 text-sm text-muted-foreground">
              {pageData.subtitle}
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {pageData.title}
            </h2>
            <p className="mt-2 text-sm text-foreground">
              {pageData.description}
            </p>
          </div>

          {/* Timezone Selection */}
          <div className="mb-6">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {pageData.timezoneLabel}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full sm:w-auto min-w-[280px]">
                        <SelectValue
                          placeholder={pageData.timezonePlaceholder}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6 border border-border rounded-lg p-4">
            {daysOfWeek.map((day) => (
              <div key={day.id} className="justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name={`${day.id}.isAvailable` as const}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium cursor-pointer">
                            <span className="sm:hidden">{day.shortLabel}</span>
                            <span className="hidden sm:inline">
                              {day.label}
                            </span>
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch(`${day.id}.isAvailable` as const) ? (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        From
                      </span>
                      <FormField
                        control={form.control}
                        name={`${day.id}.startTime` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-auto"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-muted-foreground text-sm">To</span>
                      <FormField
                        control={form.control}
                        name={`${day.id}.endTime` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-auto"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <Moon className="size-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">Closed</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Form>
  );
}
