import { Suspense } from 'react';
import LoginForm from '@/components/organisms/login-form';

export default async function LoginPage() {
  return (
    <section className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Login</h1>
      <Suspense fallback={<div>Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </section>
  );
}