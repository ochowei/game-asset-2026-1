import { medievalFantasy } from '@procforge/theme-medieval-fantasy';
import { sciFi } from '@procforge/theme-sci-fi';
import { cozyFarm } from '@procforge/theme-cozy-farm';
import { roguelikeInventory } from '@procforge/theme-roguelike-inventory';
import { createControls } from './controls';

const themes = [medievalFantasy, sciFi, cozyFarm, roguelikeInventory];

const root = document.getElementById('app')!;
const controls = createControls(themes);
root.appendChild(controls.element);

const status = document.createElement('div');
status.className = 'empty';
status.textContent = 'Gallery will appear here';
root.appendChild(status);

controls.onChange((s) => {
  status.textContent = `Selected: ${s.themeId} / seed ${s.seed} / ${s.count} icons / ${s.size}px`;
});
