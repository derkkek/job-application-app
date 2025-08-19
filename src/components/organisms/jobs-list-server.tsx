import { Suspense } from "react";
import { getJobsAction } from "@/lib/actions/jobs-server";
import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { JobCardSkeleton } from "@/components/atoms/loading-skeleton";
import type { Job } from "@/lib/models/job";

interface JobsListServerProps {
  userType?: "employer" | "applicant";
  employerId?: string;
}

async function JobsListContent({ userType, employerId }: JobsListServerProps) {
  const result = await getJobsAction(userType, employerId);

  if (!result.success) {
    throw new Error(result.error || 'Failed to load jobs');
  }

  // Type assertion to fix the work_location type mismatch
  const typedJobs = (result.data || []).map(job => ({
    ...job,
    work_location: job.work_location as 'onsite' | 'remote' | 'hybrid'
  })) as Job[];

  return <JobsListClient jobs={typedJobs} userType={userType} />;
}

function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function JobsListServer({ userType, employerId }: JobsListServerProps) {
  return (
    <Suspense fallback={<JobsListSkeleton />}>
      <JobsListContent userType={userType} employerId={employerId} />
    </Suspense>
  );
}