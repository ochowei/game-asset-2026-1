export type AttrValue = string | number | undefined;
export type Attrs = Record<string, AttrValue>;

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function attrsToString(attrs: Attrs): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined) continue;
    const s = typeof v === 'number' ? String(v) : escapeAttr(v);
    parts.push(`${k}="${s}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

export function svgElement(tag: string, attrs: Attrs = {}, children?: string): string {
  const a = attrsToString(attrs);
  if (children === undefined) return `<${tag}${a}/>`;
  return `<${tag}${a}>${children}</${tag}>`;
}

export interface SvgDocumentOptions {
  size: number;
  body: string;
  viewBox?: string;
}

export function svgDocument(opts: SvgDocumentOptions): string {
  const viewBox = opts.viewBox ?? `0 0 ${opts.size} ${opts.size}`;
  return svgElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: opts.size,
      height: opts.size,
      viewBox,
    },
    opts.body,
  );
}
