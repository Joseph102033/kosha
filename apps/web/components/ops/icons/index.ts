/**
 * SVG icon templates for accident types
 * All icons are deterministic (same input → same output)
 * Using simple shapes and system fonts only
 */

export { default as FallIcon } from './FallIcon';
export { default as CaughtIcon } from './CaughtIcon';
export { default as ElectricIcon } from './ElectricIcon';
export { default as FireIcon } from './FireIcon';
export { default as ChemicalIcon } from './ChemicalIcon';
export { default as ExplosionIcon } from './ExplosionIcon';
export { default as CollapseIcon } from './CollapseIcon';

/**
 * Accident type mapping (Korean to icon component)
 */
export const ACCIDENT_TYPE_MAP = {
  추락: 'FallIcon',
  낙하: 'FallIcon',
  끼임: 'CaughtIcon',
  협착: 'CaughtIcon',
  감전: 'ElectricIcon',
  전기: 'ElectricIcon',
  화재: 'FireIcon',
  화상: 'FireIcon',
  화학물질: 'ChemicalIcon',
  누출: 'ChemicalIcon',
  폭발: 'ExplosionIcon',
  파열: 'ExplosionIcon',
  전도: 'CollapseIcon',
  붕괴: 'CollapseIcon',
  낙상: 'CollapseIcon',
} as const;

export type AccidentType = keyof typeof ACCIDENT_TYPE_MAP;
export type IconName = typeof ACCIDENT_TYPE_MAP[AccidentType];
