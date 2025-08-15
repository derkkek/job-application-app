import { Suspense } from "react";
import { getJobsAction } from "@/actions/jobs";
import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { JobCardSkeleton } from "@/components/atoms/loading-skeleton";
import type { Job } from "@/types/job";

interface JobsListServerProps {
  userType?: "employer" | "applicant";
  employerId?: string;
}

async function JobsListContent({ userType, employerId }: JobsListServerProps) {
  const { data: jobs, error } = await getJobsAction(userType, employerId);

  if (error) {
    throw new Error(error.message);
  }

  return <JobsListClient jobs={jobs || []} userType={userType} />;
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