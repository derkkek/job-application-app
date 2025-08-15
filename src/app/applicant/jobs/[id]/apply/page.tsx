import { getJobByIdAction, getCountriesAction } from "@/actions/jobs";
import { getApplicationByJobAndApplicantAction } from "@/actions/applications";
import { getCurrentUserProfile } from "@/utils/auth";
import { ApplyJobForm } from "@/components/organisms/apply-job-form";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

interface ApplyJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyJobPage({ params }: ApplyJobPageProps) {
  const { id } = await params;
  
  // Get current user profile to get applicant ID
  const { data: userProfile, error: profileError } = await getCurrentUserProfile();
  
  if (profileError || !userProfile) {
    redirect('/login');
  }

  // Fetch job data server-side
  const { data: job, error: jobError } = await getJobByIdAction(id);
  
  if (jobError || !job) {
    notFound();
  }

  // Fetch countries for the client component
  const { data: countries } = await getCountriesAction();

  // Check if application already exists
  const { data: existingApplication } = await getApplicationByJobAndApplicantAction(id, userProfile.id);

  return (
    <ApplyJobForm 
      jobId={id}
      job={job} 
      countries={countries || []} 
      existingApplication={existingApplication}
      applicantId={userProfile.id}
    />
  );
} 