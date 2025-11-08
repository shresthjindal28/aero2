import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes (dashboard and its subpaths)
// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
// ]);

export default clerkMiddleware(async (auth, req) => {
  // Enforce authentication for protected routes
  // if (isProtectedRoute(req)) {
  //   await auth.protect({ unauthenticatedUrl: new URL("/sign-in", req.url).toString() });
  // }
});

export const config = {
  matcher: [
    // Protect all /dashboard routes
    "/dashboard(.*)",

    // Always run Clerk for API routes
    "/(api|trpc)(.*)",

    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
