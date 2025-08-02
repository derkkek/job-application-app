"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      console.log('Attempting to sign in with:', data.email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
      } else {
        console.log('Sign in successful');
        window.location.href = "/";
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label>Email</label>
          <input type="email" {...register("email")}
            className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register("password")}
            className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
} 