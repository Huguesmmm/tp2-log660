"use client";

import type React from "react";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { authenticate } from "../lib/actions";

export default function LoginForm() {
	const [errorMessage, formAction, isPending] = useActionState(
		authenticate,
		undefined,
	);

	return (
		<Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 2. The form's action is now bound to the `formAction` from the hook. */}
        <form action={formAction} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email" // The 'name' attribute is crucial for FormData
              type="email"
              placeholder="user@nextmail.com"
              required
              disabled={isPending} // Disable input while submitting
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password" // The 'name' attribute is crucial
              type="password"
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={isPending}
            />
          </div>

          {/* Submit Button - State is now driven by `isPending` */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* 3. Error messages are displayed cleanly using the `errorMessage` state */}
        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Demo Credentials Info Box (from your original code) */}
        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="mb-1 text-sm font-medium text-blue-800">
            Demo Credentials:
          </p>
          <p className="text-sm text-blue-700">Email: user@nextmail.com</p>
          <p className="text-sm text-blue-700">Password: 123456</p>
        </div>
      </CardContent>
    </Card>
	);
}
