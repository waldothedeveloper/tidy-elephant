import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/terms",
  "/privacy",
  "/waitlist(.*)",
  "/provider/become-an-ease-specialist",
]);

const isProviderRoute = createRouteMatcher(["/provider(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();
  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && !isPublicRoute(req))
    return redirectToSignIn({ returnBackUrl: req.url });

  // Check if this is a provider route (excluding onboarding and become-an-ease-specialist)
  if (
    isProviderRoute(req) &&
    !req.nextUrl.pathname.startsWith("/provider/onboarding/basic-info") &&
    !req.nextUrl.pathname.startsWith("/provider/become-an-ease-specialist")
  ) {
    // If user is not logged in, redirect to sign-in
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If user is not a provider redirect to home
    if (!sessionClaims?.metadata?.isAProvider) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Catch users who sign up for a provider account but do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /provider/onboarding/basic-info route to complete onboarding
  if (
    isProviderRoute(req) &&
    userId &&
    sessionClaims?.metadata?.isAProvider &&
    !sessionClaims?.metadata?.onboardingComplete &&
    req.nextUrl.pathname.startsWith("/provider/dashboard")
  ) {
    const onboardingUrl = new URL("/provider/onboarding/basic-info", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && !isPublicRoute(req)) return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
