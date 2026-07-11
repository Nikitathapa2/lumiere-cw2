import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthSplit from '@/components/auth/AuthSplit';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create Account — LUMIÈRE' };

export default function RegisterPage() {
  return (
    <>
      <Header variant="minimal" />
      <main className="pt-20">
        <AuthSplit
          image="/uploads/products/floral-summer-dress.jpg"
          overlayTitle={
            <>
              The
              <br />
              Collective
            </>
          }
          overlayText="Join a community defined by curation, sophistication, and a shared appreciation for the sublime."
        >
          <RegisterForm />
        </AuthSplit>
      </main>
      <Footer compact />
    </>
  );
}
