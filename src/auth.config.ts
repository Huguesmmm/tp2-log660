import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isTryingToLogin = nextUrl.pathname.startsWith("/login");

			// Case 1: User is trying to access the login page
			if (isTryingToLogin) {
				if (isLoggedIn) {
					// If they are already logged in, redirect them to the dashboard
					return Response.redirect(new URL("/dashboard", nextUrl));
				}
				// If they are not logged in, allow them to see the login page
				return true;
			}

			// Case 2: User is trying to access any other page
			if (!isLoggedIn) {
				// If they are not logged in, deny access.
				// Auth.js will automatically redirect them to the `signIn` page.
				return false;
			}

			// Case 3: User is logged in and not on the login page
			// Allow them to proceed.
			return true;
		},
	},
	providers: [],
} satisfies NextAuthConfig;
