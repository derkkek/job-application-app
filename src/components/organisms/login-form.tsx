"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
// Remove toast import since sonner is not installed
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

async function signInUser(credentials: LoginFormData) {
  const supabase = createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return { success: true };
}

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    mutate: serverSignIn,
    isPending: isLoadingSignIn,
  } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await signInUser(data);
      if (!response.success) {
        throw new Error('Sign in failed');
      }
      return response;
    },
    onSuccess: () => {
      setError("");
      console.log('Sign in successful');
      window.location.href = "/";
    },
    onError: (error) => {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => serverSignIn(data))} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...form.register("email")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoadingSignIn}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...form.register("password")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoadingSignIn}
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      
      <Button type="submit" disabled={isLoadingSignIn}>
        {isLoadingSignIn ? 'Signing in...' : 'Login'}
      </Button>
      
      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}