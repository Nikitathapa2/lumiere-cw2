/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F4F3F1', // warm off-white page canvas
        surface: '#FFFFFF', // cards, inputs, summary panels
        ink: {
          DEFAULT: '#111111', // primary near-black text
          soft: '#4A4A4A', // secondary text
        },
        muted: '#8A8A8A', // tertiary text, placeholders, captions
        line: '#E4E2DE', // hairline borders / dividers
        dark: '#1A1A1A', // dark sections / hero overlays
        'on-dark': '#F4F3F1', // text on dark
        accent: {
          DEFAULT: '#B89B3E', // mustard-gold text accent
          bg: '#F2C84B', // bright mustard promo card bg
        },


        primary: '#000000',
        'on-primary': '#ffffff',
        'primary-container': '#1c1b1b',
        'on-primary-container': '#858383',
        'primary-fixed': '#e5e2e1',
        'primary-fixed-dim': '#c8c6c5',
        'on-primary-fixed': '#1c1b1b',
        'on-primary-fixed-variant': '#474646',
        secondary: '#735c00',
        'on-secondary': '#ffffff',
        'secondary-container': '#fed65b',
        'on-secondary-container': '#745c00',
        'secondary-fixed': '#ffe088',
        'secondary-fixed-dim': '#e9c349',
        tertiary: '#000000',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#101f15',
        'on-tertiary-container': '#77887a',
        background: '#f9f9f9',
        'on-background': '#1a1c1c',
        'surface-variant': '#e2e2e2',
        'surface-dim': '#dadada',
        'surface-bright': '#f9f9f9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f3f3',
        'surface-container': '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        'on-surface': '#1a1c1c',
        'on-surface-variant': '#444748',
        outline: '#747878',
        'outline-variant': '#c4c7c7',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'inverse-surface': '#2f3131',
        'inverse-on-surface': '#f1f1f1',
        'inverse-primary': '#c8c6c5',
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'headline-lg': ['var(--font-display)', 'Playfair Display', 'serif'],
        'headline-md': ['var(--font-display)', 'Playfair Display', 'serif'],
        'display-lg': ['var(--font-display)', 'Playfair Display', 'serif'],
        'display-lg-mobile': ['var(--font-display)', 'Playfair Display', 'serif'],
        'body-md': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'body-lg': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'label-lg': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        'label-sm': ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.15em' }], // 11px
        'hero-1': ['4.5rem', { lineHeight: '1.05' }], // 72px
        'page-1': ['3rem', { lineHeight: '1.1' }], // 48px
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-lg': ['14px', { lineHeight: '1.2', letterSpacing: '0.1em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'display-lg-mobile': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        base: '8px',
        gutter: '24px',
        'section-mobile': '64px',
        'section-desktop': '120px',
        'margin-mobile': '20px',
        'margin-desktop': '80px',
      },
      letterSpacing: {
        label: '0.15em',
        wide: '0.12em',
        wider: '0.2em',
      },
      maxWidth: {
        container: '1320px',
      },
      borderRadius: {
        DEFAULT: '2px',
        none: '0px',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
