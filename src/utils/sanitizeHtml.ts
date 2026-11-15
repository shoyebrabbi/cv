const ALLOWED_TAGS = new Set([
  'A',
  'B',
  'BR',
  'DEL',
  'EM',
  'I',
  'LI',
  'MARK',
  'OL',
  'P',
  'S',
  'SPAN',
  'STRONG',
  'U',
  'UL',
]);

const DROP_CONTENT_TAGS = new Set([
  'AUDIO',
  'BASE',
  'EMBED',
  'FORM',
  'IFRAME',
  'IMG',
  'INPUT',
  'LINK',
  'MATH',
  'META',
  'OBJECT',
  'SCRIPT',
  'SELECT',
  'STYLE',
  'SVG',
  'TEMPLATE',
  'TEXTAREA',
  'TRACK',
  'VIDEO',
]);

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

export function sanitizeHref(value: string): string | null {
  const href = value.trim();
  if (!href) return null;

  try {
    const parsed = new URL(href, window.location.href);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return href;
    }
  } catch {
    return null;
  }
  return null;
}

export function sanitizeRichTextHtml(value: string): string {
  const parsed = new DOMParser().parseFromString(value, 'text/html');

  function sanitizeNode(node: Node): Node[] {
    if (node.nodeType === Node.TEXT_NODE) {
      return [parsed.createTextNode(node.textContent || '')];
    }
    if (!(node instanceof Element)) return [];

    const tag = node.tagName.toUpperCase();
    if (DROP_CONTENT_TAGS.has(tag)) return [];

    const children = Array.from(node.childNodes).flatMap(sanitizeNode);
    if (!ALLOWED_TAGS.has(tag)) return children;

    const clean = parsed.createElement(tag.toLowerCase());
    if (tag === 'A') {
      const href = sanitizeHref(node.getAttribute('href') || '');
      if (href) {
        clean.setAttribute('href', href);
        clean.setAttribute('target', '_blank');
        clean.setAttribute('rel', 'noopener noreferrer');
      }
    }
    children.forEach((child) => clean.appendChild(child));
    return [clean];
  }

  const container = parsed.createElement('div');
  Array.from(parsed.body.childNodes)
    .flatMap(sanitizeNode)
    .forEach((node) => container.appendChild(node));
  return container.innerHTML;
}
