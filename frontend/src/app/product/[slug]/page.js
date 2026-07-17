import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import StyleWith from '@/components/product/StyleWith';
import { api, safe } from '@/lib/api';
import { categoryLabel } from '@/lib/categories';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await safe(api.getProduct(slug), null);
  if (!data?.product) return { title: 'Product — LUMIÈRE' };
  return { title: `${data.product.name} — LUMIÈRE` };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await safe(api.getProduct(slug), null);
  if (!data?.product) notFound();

  const { product, related } = data;

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/collections' },
    {
      label: categoryLabel(product.category),
      href: `/collections?category=${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <>
      <Header variant="default" />

      <main className="section pt-24 pb-10 md:pb-14">
        <div className="container-lux grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <Breadcrumb items={crumbs} />
            <div className="mt-6">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>
      </main>

      <StyleWith products={related} />

      <Footer />
    </>
  );
}
