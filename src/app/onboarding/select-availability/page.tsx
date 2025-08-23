import AvailabilityClientPage from "./availability-client-page";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Monday", shortLabel: "Mon" },
  { id: "tuesday", label: "Tuesday", shortLabel: "Tue" },
  { id: "wednesday", label: "Wednesday", shortLabel: "Wed" },
  { id: "thursday", label: "Thursday", shortLabel: "Thu" },
  { id: "friday", label: "Friday", shortLabel: "Fri" },
  { id: "saturday", label: "Saturday", shortLabel: "Sat" },
  { id: "sunday", label: "Sunday", shortLabel: "Sun" },
] as const;

const PAGE_DATA = {
  title: "Select Your Availability",
  subtitle: "You're the boss.",
  description:
    "Choose which days you're available and set your business hours.",
  timezoneLabel: "Timezone",
  timezonePlaceholder: "Select your timezone",
  saveButtonText: "Save & Continue",
} as const;

export default function AvailabilityPage() {
  return (
    <AvailabilityClientPage daysOfWeek={DAYS_OF_WEEK} pageData={PAGE_DATA} />
  );
}
