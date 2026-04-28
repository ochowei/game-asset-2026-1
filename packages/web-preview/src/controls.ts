import type { Theme } from '@procforge/core';

export interface ControlState {
  themeId: string;
  seed: string;
  count: number;
  size: number;
}

export interface ControlsHandle {
  element: HTMLElement;
  getState(): ControlState;
  onChange(handler: (s: ControlState) => void): void;
  randomiseSeed(): void;
}

export function createControls(themes: Theme[]): ControlsHandle {
  const el = document.createElement('div');
  el.className = 'controls';
  el.innerHTML = `
    <label>Theme<select data-k="themeId">${themes
      .map((t) => `<option value="${t.id}">${t.displayName}</option>`)
      .join('')}</select></label>
    <label>Seed<input data-k="seed" type="text" value="pf"></label>
    <label>Count<input data-k="count" type="number" min="1" max="200" value="64"></label>
    <label>Size<select data-k="size">
      <option value="64">64</option><option value="128">128</option>
      <option value="32">32</option><option value="16">16</option>
    </select></label>
    <button data-action="random">🎲 Randomise seed</button>
    <button data-action="regen">Regenerate</button>
  `;

  const handlers: ((s: ControlState) => void)[] = [];

  function getState(): ControlState {
    const get = (k: string) => (el.querySelector(`[data-k="${k}"]`) as HTMLInputElement).value;
    return {
      themeId: get('themeId'),
      seed: get('seed'),
      count: Number(get('count')),
      size: Number(get('size')),
    };
  }

  function fire(): void {
    const s = getState();
    for (const h of handlers) h(s);
  }

  el.addEventListener('change', fire);
  el.querySelector('[data-action="regen"]')!.addEventListener('click', fire);
  el.querySelector('[data-action="random"]')!.addEventListener('click', () => {
    (el.querySelector('[data-k="seed"]') as HTMLInputElement).value = Math.random()
      .toString(36)
      .slice(2, 9);
    fire();
  });

  return {
    element: el,
    getState,
    onChange(h) {
      handlers.push(h);
    },
    randomiseSeed() {
      (el.querySelector('[data-action="random"]') as HTMLButtonElement).click();
    },
  };
}
