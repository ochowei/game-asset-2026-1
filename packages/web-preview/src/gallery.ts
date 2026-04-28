import { generateMany, type Theme } from '@procforge/core';

export interface GalleryHandle {
  element: HTMLElement;
  render(theme: Theme, baseSeed: string, count: number, size: number): void;
}

export function createGallery(): GalleryHandle {
  const el = document.createElement('div');
  el.className = 'gallery';

  function render(theme: Theme, baseSeed: string, count: number, size: number): void {
    const items = generateMany({ theme, baseSeed, count, size });
    el.innerHTML = '';
    for (const { seed, svg } of items) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.title = `${theme.id}/${seed} — click to download SVG`;
      cell.innerHTML = svg;
      cell.addEventListener('click', () => downloadSvg(`${theme.id}-${seed}.svg`, svg));
      el.appendChild(cell);
    }
  }

  return { element: el, render };
}

function downloadSvg(filename: string, svg: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
