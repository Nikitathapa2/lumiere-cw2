(function () {
  if (!window.trustedTypes || !window.trustedTypes.createPolicy) return;

  try {
    window.trustedTypes.createPolicy('lumiere-policy', {
      createHTML: function (input) {
        return String(input)
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
          .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
          .replace(/(?:javascript|vbscript)\s*:/gi, '');
      },
      createScriptURL: function (input) {
        var allowed = [window.location.origin, 'https://js.stripe.com', 'https://fonts.googleapis.com'];
        var url;
        try {
          url = new URL(input, window.location.origin);
        } catch (e) {
          throw new TypeError('Invalid URL: ' + input);
        }
        for (var i = 0; i < allowed.length; i++) {
          if (url.origin === allowed[i] || input.indexOf(allowed[i]) === 0) return input;
        }
        throw new TypeError('TrustedTypes: blocked script URL: ' + input);
      },
      createScript: function (input) {
        return input;
      },
    });
  } catch (e) {
    if (e.message && e.message.indexOf('already been created') === -1) {
      console.warn('TrustedTypes policy error:', e.message);
    }
  }
})();
