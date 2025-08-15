"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/client-button";
import { createClient } from "@/utils/supabase/client";

const schema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["employer", "applicant"]),
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
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
    
    try {
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
        // Insert the profile (not update) since it doesn't exist yet
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            id: authData.user.id,  // Important: set the ID explicitly
            email: data.email,
            user_type: data.role,
            first_name: data.first_name,
            last_name: data.last_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError(`Profile creation failed: ${profileError.message}`);
        } else {
          setSuccess("Registration successful! Check your email to confirm your account.");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Register</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label>First Name</label>
          <input type="text" {...register("first_name")}
            className="w-full border p-2 rounded" />
          {errors.first_name && <p className="text-red-500">{errors.first_name.message}</p>}
        </div>
        <div>
          <label>Last Name</label>
          <input type="text" {...register("last_name")}
            className="w-full border p-2 rounded" />
          {errors.last_name && <p className="text-red-500">{errors.last_name.message}</p>}
        </div>
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
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}