import { createClient } from '@/utils/supabase/client';

export async function testSupabaseQueries() {
  const supabase = createClient();
  
  console.log('=== Testing Supabase Queries ===');
  
  try {
    // Test 1: Simple select from job_applications
    console.log('Test 1: Simple select from job_applications');
    const { data: test1, error: error1 } = await supabase
      .from('job_applications')
      .select('*')
      .limit(1);
    console.log('Test 1 result:', test1, 'Error:', error1);
    
    // Test 2: Select with nested job_postings
    console.log('Test 2: Select with nested job_postings');
    const { data: test2, error: error2 } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_postings!job_applications_job_id_fkey(
          id,
          title
        )
      `)
      .limit(1);
    console.log('Test 2 result:', test2, 'Error:', error2);
    
    // Test 3: Select from job_application_experiences
    console.log('Test 3: Select from job_application_experiences');
    const { data: test3, error: error3 } = await supabase
      .from('job_application_experiences')
      .select('*')
      .limit(1);
    console.log('Test 3 result:', test3, 'Error:', error3);
    
    // Test 4: Get a real job ID first
    console.log('Test 4: Get a real job ID');
    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('id, title')
      .eq('is_published', true)
      .limit(1);
    
    console.log('Available jobs:', jobs, 'Error:', jobsError);
    
    if (jobs && jobs.length > 0) {
      const realJobId = jobs[0].id;
      console.log('Using real job ID:', realJobId);
      
      // Test 5: Insert into job_applications with real job ID
      console.log('Test 5: Insert into job_applications with real job ID');
      const { data: test5, error: error5 } = await supabase
        .from('job_applications')
        .insert({
          job_id: realJobId,
          applicant_id: 'test-applicant-id', // This will fail, but we'll see the structure
          first_name: 'Test',
          last_name: 'User',
          country_id: 1,
          phone_number: '1234567890',
          email: 'test@example.com',
          salary_expectation: 50000
        })
        .select()
        .single();
      console.log('Test 5 result:', test5, 'Error:', error5);
    } else {
      console.log('No published jobs found. Please create a job posting first.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
} 