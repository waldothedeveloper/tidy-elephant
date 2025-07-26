import ProviderScheduleWrapper from "./provider-schedule-wraper";
import { getFirebaseUserByClerkIDAction } from "@/app/actions/onboarding/firebase-get-user-action";

export default function ProviderOnboardingCreateSchedule() {
  const user = getFirebaseUserByClerkIDAction();
  return <ProviderScheduleWrapper user={user} />;
}
