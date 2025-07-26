"use client";

import {
  Calendar as CalendarIcon,
  Clock,
  Eye,
  Loader2Icon,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ClientPreview } from "./client-preview";
import type { FirebaseUser } from "@/types/user";
import { providerAvailabilitySchema } from "@/lib/schemas";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/app/onboarding/_hooks/use-firebase-client-auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ProviderAvailabilityForm = z.infer<typeof providerAvailabilitySchema>;

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const displayTime = new Date(
        `2000-01-01T${timeString}`
      ).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      times.push({ value: timeString, label: displayTime });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export default function ProviderScheduleWrapper() {
  const { authError } = useFirebaseAuth();
  const [isPending, startTransition] = useTransition();
  const [userProfile, setUserProfile] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  const form = useForm<ProviderAvailabilityForm>({
    resolver: zodResolver(providerAvailabilitySchema),
    defaultValues: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      blackoutDates: [],
    },
  });

  const { isDirty, isValid } = form.formState;

  async function onSubmit(values: ProviderAvailabilityForm) {
    const successMessage = "Schedule created successfully!";

    startTransition(async () => {
      try {
        // TODO: Replace with actual server action
        console.log("Submitting schedule:", values);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success(successMessage);
        // router.push("/provider"); // Navigate to provider dashboard
      } catch (error) {
        toast.error("Failed to save schedule. Please try again.");
      }
    });
  }

  const addTimeSlot = useCallback(
    (day: keyof ProviderAvailabilityForm) => {
      if (day === "blackoutDates") return;

      const currentSlots =
        (form.getValues(day) as Array<{
          startTime: string;
          endTime: string;
        }>) || [];
      const newSlots = [
        ...currentSlots,
        { startTime: "09:00", endTime: "17:00" },
      ];
      form.setValue(day, newSlots, { shouldValidate: true, shouldDirty: true });
    },
    [form]
  );

  const removeTimeSlot = useCallback(
    (day: keyof ProviderAvailabilityForm, index: number) => {
      if (day === "blackoutDates") return;

      const currentSlots =
        (form.getValues(day) as Array<{
          startTime: string;
          endTime: string;
        }>) || [];
      const newSlots = currentSlots.filter((_, i) => i !== index);
      form.setValue(day, newSlots, { shouldValidate: true, shouldDirty: true });
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
              disabled={isPending || !isDirty || !isValid}
              type="submit"
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              Save Schedule & Continue
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-12">
            <h2 className="text-3xl font-semibold text-foreground">
              Set Your Schedule
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
              Define your weekly availability and mark any unavailable dates.
              See how clients will view your schedule in real-time.
            </p>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Side - Provider Controls */}
            <div className="space-y-8">
              {/* Weekly Schedule Section */}
              <div className="rounded-lg border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Weekly Schedule
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Set your regular weekly availability. These hours will repeat
                  each week.
                </p>

                <div className="space-y-4">
                  {DAYS_OF_WEEK.map(({ key, label }) => (
                    <div
                      key={key}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-foreground">
                          {label}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(key)}
                          className="text-xs h-7"
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {(form.watch(key) || []).map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`${key}.${index}.startTime`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Start" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((time) => (
                                        <SelectItem
                                          key={time.value}
                                          value={time.value}
                                        >
                                          {time.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <span className="text-muted-foreground text-xs px-1">
                              -
                            </span>

                            <FormField
                              control={form.control}
                              name={`${key}.${index}.endTime`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="End" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIME_OPTIONS.map((time) => (
                                        <SelectItem
                                          key={time.value}
                                          value={time.value}
                                        >
                                          {time.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTimeSlot(key, index)}
                              className="text-destructive hover:text-destructive p-1 size-7"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        ))}

                        {(!form.watch(key) ||
                          form.watch(key)?.length === 0) && (
                          <p className="text-xs text-muted-foreground italic py-2">
                            No hours set
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blackout Dates Section */}
              <div className="rounded-lg border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarIcon className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Unavailable Dates
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Mark specific dates when you are not available (vacations,
                  holidays, etc.)
                </p>

                <FormField
                  control={form.control}
                  name="blackoutDates"
                  render={({ field }) => (
                    <FormItem>
                      <Calendar
                        mode="multiple"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Right Side - Client Preview */}
            <div className="space-y-8">
              <div className="rounded-lg border border-border p-6 bg-muted/5">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Client View Preview
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  This is how clients will see your availability when booking.
                </p>

                {/* Dynamic Preview Content */}
                <ClientPreview
                  weeklySchedule={{
                    monday: form.watch("monday") || [],
                    tuesday: form.watch("tuesday") || [],
                    wednesday: form.watch("wednesday") || [],
                    thursday: form.watch("thursday") || [],
                    friday: form.watch("friday") || [],
                    saturday: form.watch("saturday") || [],
                    sunday: form.watch("sunday") || [],
                  }}
                  blackoutDates={form.watch("blackoutDates") || []}
                  userProfile={userProfile}
                />
              </div>
            </div>
          </div>

          <FormMessage className="mt-6">
            {form.formState.errors.root?.message}
          </FormMessage>
        </div>
      </form>
    </Form>
  );
}
