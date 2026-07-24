
const TAG_RE = /<\/?[a-z][\s\S]*?>/gi;          // any HTML/XML tag
const COMMENT_RE = /<!--[\s\S]*?-->/g;          // HTML comments
const DANGEROUS_PROTO_RE = /(?:javascript|vbscript|data)\s*:/gi; // script-y URLs
const EVENT_ATTR_RE = /\son\w+\s*=/gi;          // stray on*= handlers
// Strip C0 control chars and DEL (0x7F) but keep TAB (\x09) / LF (\x0A) / CR (\x0D).
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;


export function stripUnsafe(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(COMMENT_RE, '')
    .replace(TAG_RE, '')
    .replace(EVENT_ATTR_RE, ' ')
    .replace(DANGEROUS_PROTO_RE, '')
    .replace(CONTROL_RE, '')
    .trim();
}


export function escapeHtml(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
