"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { testSupabaseQueries } from "@/utils/test-supabase";

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    };
    
    console.log('Environment variables:', envCheck);
    
    try {
      await testSupabaseQueries();
      setResult({ 
        message: "Tests completed. Check browser console for details.",
        envCheck 
      });
    } catch (error) {
      setResult({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        envCheck 
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Connection</h1>
      
      <Button onClick={testConnection} disabled={loading}>
        {loading ? "Testing..." : "Test Supabase Connection"}
      </Button>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold">What this tests:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Environment variables are set correctly</li>
          <li>Supabase client can connect to your database</li>
          <li>Basic queries work (select, insert)</li>
          <li>Table structure is correct</li>
        </ul>
      </div>
    </div>
  );
} 