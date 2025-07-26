import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { FirebaseUser } from "@/types/user";
import Image from "next/image";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

type WeeklySchedule = {
  monday: Array<{ startTime: string; endTime: string }>;
  tuesday: Array<{ startTime: string; endTime: string }>;
  wednesday: Array<{ startTime: string; endTime: string }>;
  thursday: Array<{ startTime: string; endTime: string }>;
  friday: Array<{ startTime: string; endTime: string }>;
  saturday: Array<{ startTime: string; endTime: string }>;
  sunday: Array<{ startTime: string; endTime: string }>;
};

export const ClientPreview = ({
  weeklySchedule,
  blackoutDates,
  userProfile,
}: {
  weeklySchedule: WeeklySchedule;
  blackoutDates: Date[];
  userProfile?: FirebaseUser | null;
}) => {
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const hasAnyAvailability = Object.values(weeklySchedule).some(
    (daySlots) => daySlots && daySlots.length > 0
  );

  const getNextAvailableDay = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayMapping = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    // Check from today onwards
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDay + i) % 7;
      const dayKey = dayMapping[dayIndex] as keyof WeeklySchedule;
      const daySlots = weeklySchedule[dayKey];

      if (daySlots && daySlots.length > 0) {
        const dayName = DAYS_OF_WEEK.find((d) => d.key === dayKey)?.label;
        const firstSlot = daySlots[0];
        return {
          day: dayName,
          time: `${formatTime(firstSlot.startTime)} - ${formatTime(firstSlot.endTime)}`,
        };
      }
    }
    return null;
  };

  if (!hasAnyAvailability) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarIcon className="size-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          Set your weekly schedule to see the client preview
        </p>
      </div>
    );
  }

  const nextAvailable = getNextAvailableDay();

  return (
    <div className="space-y-6">
      {/* Provider Profile Header */}
      <div className="bg-background rounded-lg border p-6">
        <div className="flex items-start gap-4 relative">
          {userProfile?.profile.photo ? (
            <Image
              fill
              src={userProfile.profile.photo}
              alt={`${userProfile.profile.firstName} ${userProfile.profile.lastName}`}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="size-16 bg-muted rounded-full flex items-center justify-center">
              <User className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {userProfile
                ? `${userProfile.profile.firstName} ${userProfile.profile.lastName}`
                : "Your Name Here"}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-current text-yellow-400" />
                <span>
                  {userProfile?.providerRatings
                    ? `${userProfile.providerRatings.averageRating} (${userProfile.providerRatings.totalReviews} reviews)`
                    : "4.9 (42 reviews)"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                <span>
                  {userProfile?.profile.address
                    ? `${userProfile.profile.address.city}, ${userProfile.profile.address.state}`
                    : "Your City, State"}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {userProfile?.profile.about ||
                "This is a preview of how your profile description will appear to clients. Your actual description from the onboarding will be displayed here, helping clients understand your services and experience."}
            </p>
          </div>
        </div>
      </div>

      {/* Next Available Section */}
      {nextAvailable && (
        <div className="bg-background rounded-lg border p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Next Available
          </h4>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-primary" />
            <span className="text-foreground">
              {nextAvailable.day}: {nextAvailable.time}
            </span>
          </div>
        </div>
      )}

      {/* Weekly Availability Summary */}
      <div className="bg-background rounded-lg border p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Weekly Availability
        </h4>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const daySlots = weeklySchedule[key as keyof WeeklySchedule];
            const hasSlots = daySlots && daySlots.length > 0;

            return (
              <div key={key} className="flex items-start justify-between">
                <span className="text-sm font-medium text-foreground min-w-[80px]">
                  {label}
                </span>
                <div className="flex-1 text-right">
                  {hasSlots ? (
                    <div className="space-y-1">
                      {daySlots.map((slot, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          {formatTime(slot.startTime)} -{" "}
                          {formatTime(slot.endTime)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Not available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blackout Dates Calendar Preview */}
      <div className="bg-background rounded-lg border p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">
          Availability Calendar
        </h4>
        <div className="text-xs text-muted-foreground mb-3">
          {blackoutDates && blackoutDates.length > 0
            ? `${blackoutDates.length} date${blackoutDates.length === 1 ? "" : "s"} marked as unavailable`
            : "All dates available (subject to weekly schedule)"}
        </div>
        <Calendar
          mode="multiple"
          selected={blackoutDates}
          disabled={(date) => {
            // Disable past dates and blackout dates
            return (
              date < new Date() ||
              blackoutDates?.some(
                (blackoutDate) =>
                  blackoutDate.toDateString() === date.toDateString()
              )
            );
          }}
          className="rounded-md border-0 p-0 pointer-events-none"
          classNames={{
            day_disabled: "text-muted-foreground/40 line-through",
            day_selected:
              "bg-destructive/10 text-destructive border-destructive/20",
            day: "cursor-default",
          }}
          showOutsideDays={false}
        />
        <div className="text-xs text-muted-foreground mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-3 bg-destructive/10 border border-destructive/20 rounded"></div>
            <span>Unavailable dates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 bg-muted-foreground/40 rounded line-through"></div>
            <span>Past dates</span>
          </div>
        </div>
      </div>

      {/* Booking CTA Preview */}
      <div className="bg-primary/5 rounded-lg border border-primary/20 p-4">
        <div className="text-center">
          <Button className="w-full" disabled>
            Book This Organizer
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            (This is how the booking button will appear to clients)
          </p>
        </div>
      </div>
    </div>
  );
};
