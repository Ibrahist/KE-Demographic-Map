import { AdminLevel } from './indicators';

export interface HierarchyBreadcrumb {
  level: 'national' | 'county' | 'subcounty' | 'ward' | 'village';
  code?: number | string;
  name: string;
}

export type ColorScaleType = 'quantile' | 'natural_breaks' | 'linear';

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // 5 or 6 hex colors (e.g. light to dark)
  isColorBlindSafe: boolean;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'viridis',
    name: 'Viridis (Default / Multi-hue)',
    colors: ['#fde725', '#5dc963', '#21908c', '#3b528b', '#440154'],
    isColorBlindSafe: true,
  },
  {
    id: 'plasma',
    name: 'Plasma (Warm / High-contrast)',
    colors: ['#fca636', '#e16462', '#b12a90', '#6a00a8', '#0d0887'],
    isColorBlindSafe: true,
  },
  {
    id: 'ylgnbu',
    name: 'YlGnBu (Yellow-Green-Blue)',
    colors: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
    isColorBlindSafe: true,
  },
  {
    id: 'blues',
    name: 'Blues (Single-hue)',
    colors: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
    isColorBlindSafe: true,
  },
  {
    id: 'greens',
    name: 'Greens (Single-hue)',
    colors: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
    isColorBlindSafe: true,
  },
  {
    id: 'oranges',
    name: 'Oranges (Single-hue)',
    colors: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
    isColorBlindSafe: true,
  },
];

export interface UnitTooltipData {
  x: number;
  y: number;
  name: string;
  level: string;
  parentCounty?: string;
  parentSubcounty?: string;
  indicatorName: string;
  valueStr: string;
  rawVal: number | null;
  rank?: string;
  totalUnits?: number;
  popTotal?: number;
  areaSqKm?: number;
  density?: number;
  isAvailable: boolean;
}

export interface LegendBreak {
  min: number;
  max: number;
  color: string;
  label: string;
}

