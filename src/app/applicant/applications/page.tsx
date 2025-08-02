"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApplicantApplications, deleteApplication, getApplicationExperiences } from "@/utils/applications";
import { ApplicationWithExperiences } from "@/types/application";
import Link from "next/link";

export default function ApplicantApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithExperiences[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error } = await getApplicantApplications();
    if (error) {
      setError(error.message || "Failed to load applications");
    } else {
      // Load experiences for each application
      const applicationsWithExperiences = await Promise.all(
        (data || []).map(async (app) => {
          const { data: experiences } = await getApplicationExperiences(app.id);
          return {
            ...app,
            experiences: experiences || [],
          };
        })
      );
      setApplications(applicationsWithExperiences);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    const { error } = await deleteApplication(id);
    if (error) {
      setError(error.message || "Failed to delete application");
    } else {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Applied Jobs</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No applications yet.</p>
          <Link href="/applicant/jobs">
            <Button>Browse Available Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-2">
                {application.job_postings?.title || "Unknown Job"}
              </h3>
              <p className="text-gray-600 mb-2">
                {application.first_name} {application.last_name}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Salary: ${application.salary_expectation?.toLocaleString()} • 
                Applied {new Date(application.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                {application.experiences?.length || 0} experience(s)
              </p>
              {application.additional_expectations && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {application.additional_expectations}
                </p>
              )}
              <div className="flex gap-2">
                <Link href={`/applicant/jobs/${application.job_postings?.id}/apply`}>
                  <Button variant="outline" size="sm">Edit Application</Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(application.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 