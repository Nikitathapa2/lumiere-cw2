import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutView from '@/components/checkout/CheckoutView';

export const metadata = {
  title: 'Checkout — LUMIÈRE',
};

export default function CheckoutPage() {
  return (
    <>
      <Header variant="checkout" step="checkout" />

      <main className="section pt-24 pb-12 md:pb-16">
        <div className="container-lux">
          <CheckoutView />
        </div>
      </main>

      <Footer compact locale="ENGLISH / USD" />
    </>
  );
}
