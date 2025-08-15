"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Job, Country } from "@/types/job";

interface JobDetailsClientProps {
  job: Job;
  countries: Country[];
}

export function JobDetailsClient({ job, countries }: JobDetailsClientProps) {
  return (
    <>
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Job Requirements</h2>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/applicant/jobs">
          <Button variant="outline">Back to Available Jobs</Button>
        </Link>
      </div>
    </>
  );
}
