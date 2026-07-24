'use client';

function sanitizeHTML(input) {
  const s = String(input);
  if (!s.includes('<')) return s;
  return s
    .replace(/<!--[\s\S]*?-->/g, '')
    // Strip executable tags but NOT <style>
    .replace(/<\s*(script|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:javascript|vbscript)\s*:/gi, '');
}

export function installTrustedTypesPolicy() {
  if (typeof window === 'undefined') return;
  if (!window.trustedTypes || !window.trustedTypes.createPolicy) return;

  for (const name of ['default', 'lumiere-policy']) {
    try {
      window.trustedTypes.createPolicy(name, {
        createHTML: sanitizeHTML,

        createScriptURL: (input) => {
          const url = new URL(input, window.location.origin);
          const ALLOWED_ORIGINS = [
            window.location.origin,
            'https://js.stripe.com',
            'https://fonts.googleapis.com',
          ];
          if (ALLOWED_ORIGINS.some((o) => url.origin === o || input.startsWith(o))) {
            return input;
          }
          throw new TypeError(`[TrustedTypes] Blocked script URL: ${input}`);
        },

        createScript: (input) => input,
      });
    } catch (err) {
      if (!err.message?.includes('already been created')) {
        console.warn(`[TrustedTypes] Policy '${name}' creation failed:`, err.message);
      }
    }
  }
}
