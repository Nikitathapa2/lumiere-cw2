import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AccountShell from '@/components/account/AccountShell';

export const metadata = { title: 'My Account — LUMIÈRE' };

export default function AccountLayout({ children }) {
  return (
    <>
      <Header variant="default" />
      <main className="pt-24">
        <AccountShell>{children}</AccountShell>
      </main>
      <Footer compact />
    </>
  );
}
