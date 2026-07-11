import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthSplit from '@/components/auth/AuthSplit';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign In — LUMIÈRE' };

export default function LoginPage() {
  return (
    <>
      <Header variant="minimal" />
      <main className="pt-20">
        <AuthSplit image="/uploads/products/women-s-blazer.jpg">
          <Suspense fallback={<div className="min-h-[20rem]" />}>
            <LoginForm />
          </Suspense>
        </AuthSplit>
      </main>
      <Footer compact />
    </>
  );
}
