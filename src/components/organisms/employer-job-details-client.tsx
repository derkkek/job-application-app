"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteJobAction } from "@/actions/jobs";
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
      const { error } = await deleteJobAction(job.id);
      if (error) {
        alert(error.message || "Failed to delete job");
      } else {
        router.push("/employer/jobs");
      }
    } catch (err) {
      alert("Failed to delete job");
    } finally {
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
