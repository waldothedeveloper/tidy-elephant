import { Button } from "@/components/ui/button";
export const OnboardingNavButtons = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-6 flex items-center justify-between gap-x-6">
        <Button variant="outline" type="button">
          Previous
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </div>
  );
};
