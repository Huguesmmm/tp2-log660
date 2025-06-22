"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export async function authenticate(
	previousState: string | undefined,
	formData: FormData,
) {
	const callBackUrl = formData.get("callbackUrl") as string;
	try {
		await signIn("credentials", {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			redirectTo: callBackUrl || DEFAULT_LOGIN_REDIRECT,
		});
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return "Invalid email or password";
				default:
					return "An unexpected error occurred. Please try again.";
			}
		}
		throw error;
	}
}
