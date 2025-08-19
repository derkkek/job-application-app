"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteJobAction } from "@/lib/actions/jobs-server";
import { useRouter } from "next/navigation";
import type { Job, Country } from "@/lib/models/job";

interface EmployerJobDetailsClientProps {
  job: Job;
  countries: Country[];
}

export function EmployerJobDetailsClient({ job, countries }: EmployerJobDetailsClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteJobAction(job.id);
      if (!result.success) {
        alert(result.error || "Failed to delete job");
        setIsDeleting(false);
      } else {
        // Use window.location for immediate navigation to avoid race conditions
        window.location.href = "/employer/jobs";
      }
    } catch (err) {
      alert("Failed to delete job");
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
