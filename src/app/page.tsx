import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HomeContent from '@/components/organisms/home-content';

export default async function HomePage() {
  const supabase = await createClient();
  
  try {
    // Get current user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // If no user is authenticated, redirect to login
    if (userError || !user) {
      redirect('/login');
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If user doesn't have a profile, you might want to redirect to setup
    if (profileError || !profile) {
      console.error('Profile not found for user:', user.id);
      // You could redirect to a profile setup page instead
      redirect('/login');
    }

    return (
      <section className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <HomeContent userProfile={profile} />
        </Suspense>
      </section>
    );
  } catch (error) {
    console.error('Error in HomePage:', error);
    redirect('/login');
  }
}