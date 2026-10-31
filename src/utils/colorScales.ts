import { ColorScaleType, LegendBreak } from '@/types/map';

/**
 * Calculates quantiles for a numeric array.
 */
export function getQuantileBreaks(values: number[], k: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const breaks: number[] = [];
  for (let i = 1; i < k; i++) {
    const qIndex = Math.floor((i / k) * (sorted.length - 1));
    breaks.push(sorted[qIndex]);
  }
  return breaks;
}

/**
 * Jenks Natural Breaks classification algorithm.
 */
export function getJenksBreaks(data: number[], nClasses: number): number[] {
  if (!data || data.length === 0) return [];
  if (data.length <= nClasses) {
    const sorted = [...data].sort((a, b) => a - b);
    return sorted.slice(1);
  }

  const sortedList = [...data].sort((a, b) => a - b);
  const numData = sortedList.length;

  const mat1: number[][] = Array.from({ length: numData + 1 }, () => Array(nClasses + 1).fill(0));
  const mat2: number[][] = Array.from({ length: numData + 1 }, () => Array(nClasses + 1).fill(0));

  for (let y = 1; y <= nClasses; y++) {
    mat1[0][y] = 1;
    mat2[0][y] = 0;
    for (let t = 1; t <= numData; t++) {
      mat2[t][y] = Infinity;
    }
  }

  let v = 0;
  for (let l = 2; l <= numData; l++) {
    let s1 = 0;
    let s2 = 0;
    let w = 0;
    for (let m = 1; m <= l; m++) {
      const i3 = l - m + 1;
      const val = sortedList[i3 - 1];
      s2 += val * val;
      s1 += val;
      w++;
      v = s2 - (s1 * s1) / w;
      const i4 = i3 - 1;
      if (i4 !== 0) {
        for (let j = 2; j <= nClasses; j++) {
          if (mat2[l][j] >= v + mat2[i4][j - 1]) {
            mat1[l][j] = i3;
            mat2[l][j] = v + mat2[i4][j - 1];
          }
        }
      }
    }
    mat1[l][1] = 1;
    mat2[l][1] = v;
  }

  let k = numData;
  const kclass: number[] = Array(nClasses + 1).fill(0);
  kclass[nClasses] = sortedList[sortedList.length - 1];
  kclass[0] = sortedList[0];

  for (let countNum = nClasses; countNum >= 2; countNum--) {
    const id = Math.max(0, Math.min(numData, Math.floor(mat1[k][countNum]) - 2));
    kclass[countNum - 1] = sortedList[id];
    k = Math.max(1, Math.floor(mat1[k][countNum]) - 1);
  }

  return kclass.slice(1, nClasses);
}

/**
 * Builds legend classes and assign colors.
 */
export function buildLegendBreaks(
  values: number[],
  colors: string[],
  scaleType: ColorScaleType,
  unit: string
): LegendBreak[] {
  if (values.length === 0) return [];
  const validVals = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (validVals.length === 0) return [];

  const min = Math.min(...validVals);
  const max = Math.max(...validVals);

  if (min === max) {
    return [
      {
        min,
        max,
        color: colors[Math.floor(colors.length / 2)],
        label: `${min.toLocaleString()} ${unit}`,
      },
    ];
  }

  let rawBreaks: number[] = [];
  const k = colors.length;

  if (scaleType === 'quantile') {
    rawBreaks = getQuantileBreaks(validVals, k);
  } else if (scaleType === 'natural_breaks') {
    rawBreaks = getJenksBreaks(validVals, k);
  } else {
    // Linear / Equal interval
    const step = (max - min) / k;
    for (let i = 1; i < k; i++) {
      rawBreaks.push(min + i * step);
    }
  }

  // Ensure unique strictly increasing breaks
  const uniqueBreaks = Array.from(new Set(rawBreaks)).sort((a, b) => a - b);
  const thresholds = [min, ...uniqueBreaks, max];

  const legendBreaks: LegendBreak[] = [];
  for (let i = 0; i < thresholds.length - 1; i++) {
    const bMin = thresholds[i];
    const bMax = thresholds[i + 1];
    const color = colors[Math.min(i, colors.length - 1)];

    const formatNum = (n: number) =>
      n >= 1000 ? Math.round(n).toLocaleString() : n >= 10 ? n.toFixed(1) : n.toFixed(2);

    legendBreaks.push({
      min: bMin,
      max: bMax,
      color,
      label: `${formatNum(bMin)} – ${formatNum(bMax)}`,
    });
  }

  return legendBreaks;
}

/**
 * Returns matching color for a given value based on computed legend breaks.
 */
export function getColorForValue(val: number | null | undefined, breaks: LegendBreak[]): string {
  if (val == null || isNaN(val)) {
    return '#4a4a4a'; // Neutral gray for missing data
  }
  for (let i = 0; i < breaks.length; i++) {
    const b = breaks[i];
    if (i === breaks.length - 1) {
      if (val >= b.min && val <= b.max) return b.color;
    } else {
      if (val >= b.min && val < b.max) return b.color;
    }
  }
  // Fallback to highest or lowest
  if (breaks.length > 0) {
    return val > breaks[breaks.length - 1].max
      ? breaks[breaks.length - 1].color
      : breaks[0].color;
  }
  return '#3182bd';
}

