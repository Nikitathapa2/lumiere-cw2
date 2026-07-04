import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import CuratedCategories from '@/components/home/CuratedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromotionalSection from '@/components/home/PromotionalSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';
import { api, safe, toCardProduct } from '@/lib/api';

export const metadata = {
  title: 'LUMIÈRE | Premium Boutique Fashion',
};

function toFeatured(p) {
  const card = toCardProduct(p);
  return {
    id: card.slug,
    name: card.name,
    price: `$${Number(card.price).toFixed(2)}`,
    rating: (card.rating ?? 4.8).toFixed(1),
    badge: card.isNewArrival ? 'New' : null,
    imageSrc: card.image,
    imageAlt: card.name,
    href: `/product/${card.slug}`,
  };
}

export default async function HomePage() {
  const data = await safe(api.getProducts({ limit: 8 }), { items: [] });
  const featured = (data?.items || []).map(toFeatured);

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg text-ink pt-20">
        <Hero />
        <CuratedCategories />
        <FeaturedProducts products={featured} />
        <PromotionalSection />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
