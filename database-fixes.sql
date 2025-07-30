-- Check current profiles with null names
SELECT id, email, first_name, last_name, user_type 
FROM profiles 
WHERE first_name IS NULL OR last_name IS NULL;

-- Update existing profiles with null names (replace with actual values)
-- UPDATE profiles 
-- SET first_name = 'Unknown', last_name = 'User' 
-- WHERE first_name IS NULL OR last_name IS NULL;

-- Check RLS policies for job_applications
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'job_applications';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'job_applications';

-- Check if the unique constraint exists
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'job_applications'::regclass;

-- Check table structure
\d job_applications

-- Check if experiences table exists and has correct structure
\d job_application_experiences

-- Test inserting a simple application (replace with real values)
-- INSERT INTO job_applications (
--   job_id, 
--   applicant_id, 
--   first_name, 
--   last_name, 
--   country_id, 
--   phone_number, 
--   email, 
--   salary_expectation
-- ) VALUES (
--   'your-job-id-here',
--   'your-user-id-here', 
--   'Test', 
--   'User', 
--   1, 
--   '1234567890', 
--   'test@example.com', 
--   50000
-- ); 