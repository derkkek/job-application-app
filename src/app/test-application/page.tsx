"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { debugApplicationCreation, getRealJobId } from "@/utils/debug";
import { testSupabaseQueries } from "@/utils/test-supabase";

export default function TestApplicationPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApplication = async () => {
    setLoading(true);
    
    // Get a real job ID first
    const realJobId = await getRealJobId();
    
    if (!realJobId) {
      setResult({ error: "No published jobs found. Please create a job posting first." });
      setLoading(false);
      return;
    }
    
    // Test with minimal data
    const testData = {
      job_id: realJobId,
      first_name: "Test",
      last_name: "User",
      country_id: 1,
      phone_number: "1234567890",
      email: "test@example.com",
      salary_expectation: 50000,
      additional_expectations: "Test expectations"
    };

    const { data, error } = await debugApplicationCreation(realJobId, testData);
    
    setResult({ data, error, jobId: realJobId });
    setLoading(false);
  };

  const testSupabase = async () => {
    setLoading(true);
    await testSupabaseQueries();
    setResult({ message: "Check browser console for detailed results" });
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Application Creation</h1>
      
      <div className="space-y-4">
        <Button onClick={testSupabase} disabled={loading}>
          {loading ? "Testing..." : "Test Supabase Queries"}
        </Button>

        <Button onClick={testApplication} disabled={loading}>
          {loading ? "Testing..." : "Test Application Creation"}
        </Button>
      </div>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Test Supabase Queries" first to check basic database access</li>
          <li>Check the browser console for detailed error information</li>
          <li>Make sure you have at least one published job posting</li>
          <li>Click "Test Application Creation" to test the full flow</li>
          <li>Share any error messages from the console</li>
        </ol>
      </div>
    </div>
  );
} 