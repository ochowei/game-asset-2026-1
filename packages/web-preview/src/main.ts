import type { Theme } from '@procforge/core';
import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import { createControls } from './controls';
import { createGallery } from './gallery';

const themes: Theme[] = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];
const themesById = new Map(themes.map((t) => [t.id, t]));

const root = document.getElementById('app')!;
const controls = createControls(themes);
const gallery = createGallery();
root.appendChild(controls.element);
root.appendChild(gallery.element);

function refresh(): void {
  const s = controls.getState();
  const theme = themesById.get(s.themeId);
  if (!theme) return;
  gallery.render(theme, s.seed, s.count, s.size);
}

controls.onChange(refresh);
refresh();
