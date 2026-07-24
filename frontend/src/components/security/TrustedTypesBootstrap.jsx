import Script from 'next/script';

// Loads a tiny boot script before the app becomes interactive so the Trusted
// Types policy is installed before other client-side code runs.
export default function TrustedTypesBootstrap({ nonce }) {
  return (
    <Script
      id="trusted-types-bootstrap"
      nonce={nonce}
      strategy="beforeInteractive"
      src="/trusted-types-bootstrap.js"
    />
  );
}
