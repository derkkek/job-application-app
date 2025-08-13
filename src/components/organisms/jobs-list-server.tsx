import { Suspense } from "react";
import { getJobsServer } from "@/utils/jobs-server";
import { JobsListClient } from "@/components/organisms/jobs-list-client";
import { JobCardSkeleton } from "@/components/atoms/loading-skeleton";

interface JobsListServerProps {
  userType?: "employer" | "applicant";
}

async function JobsListContent({ userType }: JobsListServerProps) {
  const { data: jobs, error } = await getJobsServer(userType);

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

export function JobsListServer({ userType }: JobsListServerProps) {
  return (
    <Suspense fallback={<JobsListSkeleton />}>
      <JobsListContent userType={userType} />
    </Suspense>
  );
} 