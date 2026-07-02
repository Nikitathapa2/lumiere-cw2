import { Playfair_Display, Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AddedToBagDrawer from '@/components/cart/AddedToBagDrawer';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'LUMIÈRE — Conscious Luxury, Defined by Hand',
  description:
    'LUMIÈRE — elevated essentials for the modern wardrobe. Quality, sustainability, and timeless design.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <AddedToBagDrawer />
              </CartProvider>
            </WishlistProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
