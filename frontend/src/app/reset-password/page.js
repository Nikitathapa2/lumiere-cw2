import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = { title: 'Reset Password — LUMIÈRE' };

export default function ResetPasswordPage() {
  return (
    <>
      <Header variant="minimal" />
      <main className="section flex min-h-[calc(100vh-5rem)] items-center justify-center pt-20 pb-16">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="min-h-[16rem]" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer compact />
    </>
  );
}
