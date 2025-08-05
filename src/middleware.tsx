import { NextRequest, NextResponse } from "next/server";
import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms",
  "/privacy",
  "/become-an-ease-specialist",
  "/api/webhooks/clerk(.*)",
]);

const isProviderRoute = createRouteMatcher(["/provider(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isOnboardingWelcomeRoute = createRouteMatcher(["/onboarding/welcome"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const clerkClientInstance = await clerkClient();
  const { userId, redirectToSignIn } = await auth();

  // ROUTES
  const homeURL = new URL("/", req.url);
  const onboardingUrl = new URL("/onboarding/welcome", req.url);

  // 1. Non authenticated users can only visit public routes
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    const currentUser = await clerkClientInstance.users.getUser(userId);

    // USER METADATA
    const isProvider = currentUser.privateMetadata?.isAProvider;
    const onboardingComplete = currentUser.privateMetadata?.onboardingComplete;

    // Provider routes
    if (isProviderRoute(req)) {
      // 2. Authenticated users (not providers) cannot visit provider routes
      if (!isProvider) {
        return NextResponse.redirect(homeURL);
      }

      // 3. Providers without completed onboarding cannot visit provider routes
      if (isProvider && !onboardingComplete) {
        // we might eventually redirect to the step where they left off
        return NextResponse.redirect(onboardingUrl);
      }

      // Provider with completed onboarding can access provider routes
      if (isProvider && onboardingComplete) {
        return NextResponse.next();
      }
    }

    // Onboarding routes
    if (isOnboardingRoute(req)) {
      if (isOnboardingWelcomeRoute(req)) {
        // Allow access to the welcome onboarding page
        return NextResponse.next();
      }

      if (!isProvider) {
        // 2. Authenticated users (not providers) cannot visit onboarding routes
        return NextResponse.redirect(homeURL);
      }

      // 3. Providers can access onboarding routes (regardless of completion status)
      if (isProvider && !onboardingComplete) {
        return NextResponse.next();
      }

      // 4. Providers who completed onboarding should be redirected away from onboarding routes
      if (isProvider && onboardingComplete) {
        const providerDashboard = new URL("/provider/dashboard", req.url);
        return NextResponse.redirect(providerDashboard);
      }
    }
  }

  // Allow access to public routes and other authenticated user routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
