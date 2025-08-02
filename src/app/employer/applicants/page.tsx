"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getEmployerApplicants, getApplicationExperiences } from "@/utils/applications";
import Link from "next/link";

export default function EmployerApplicantsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error } = await getEmployerApplicants();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No applications received yet.</p>
          <p className="text-gray-400">When applicants apply to your job postings, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <div key={application.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="mb-3">
                <h3 className="text-lg font-semibold mb-1">
                  {application.job_postings?.title || "Unknown Job"}
                </h3>
                <p className="text-sm text-gray-500">
                  {application.job_postings?.countries?.name || "Unknown Location"}
                </p>
              </div>
              
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">
                  {application.first_name} {application.last_name}
                </h4>
                <p className="text-sm text-gray-600">{application.email}</p>
                <p className="text-sm text-gray-600">{application.phone_number}</p>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Salary Expectation:</span> ${application.salary_expectation?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Applied {new Date(application.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Experience:</span> {application.experiences?.length || 0} position(s)
                </p>
              </div>
              
              {application.additional_expectations && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    <span className="font-medium">Additional Expectations:</span> {application.additional_expectations}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Link href={`/employer/jobs/${application.job_postings?.id}`}>
                  <Button variant="outline" size="sm">View Job</Button>
                </Link>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 