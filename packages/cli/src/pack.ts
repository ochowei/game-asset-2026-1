import JSZip from 'jszip';

export interface PackEntry {
  path: string;
  data: Buffer | string;
}

export async function packToZip(entries: PackEntry[]): Promise<Buffer> {
  const zip = new JSZip();
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.path)) throw new Error(`duplicate entry: ${e.path}`);
    seen.add(e.path);
    zip.file(e.path, e.data);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
