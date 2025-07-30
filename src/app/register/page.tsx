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
  role: z.enum(["employer", "applicant"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess("");
    const supabase = createClient();
    
    // First, sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    if (authError) {
      setError(authError.message);
      return;
    }

    if (authData.user) {
      // Update the profile with the correct user type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: data.role })
        .eq('id', authData.user.id);
      
      if (profileError) {
        setError(profileError.message);
      } else {
        setSuccess("Registration successful! Check your email to confirm.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Register</h1>
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
        <div>
          <label>Role</label>
          <select {...register("role")} className="w-full border p-2 rounded">
            <option value="">Select role</option>
            <option value="employer">Employer</option>
            <option value="applicant">Applicant</option>
          </select>
          {errors.role && <p className="text-red-500">{errors.role.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>Register</Button>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </form>
    </div>
  );
} 