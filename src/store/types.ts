import type { CVDType } from '@/color/cvd';
import type { HarmonyKind } from '@/color/harmony';
import type { InterpolationSpace } from '@/color/interpolate';
import type { ColorFormat, OKLCH } from '@/color/types';

export type TabId =
  | 'inspector'
  | 'matrix'
  | 'palette'
  | 'gradient'
  | 'contrast'
  | 'gamut'
  | 'cvd'
  | 'image'
  | 'bulk'
  | 'export';

export type Theme = 'light' | 'dark' | 'system';

export type Swatch = {
  id: string;
  color: OKLCH;
  label?: string;
  lockL?: boolean;
  lockC?: boolean;
  lockH?: boolean;
};

export type Palette = {
  id: string;
  name: string;
  swatches: Swatch[];
  harmony?: HarmonyKind;
};

export type MatrixConfig = {
  hues: number[]; // hue values for rows
  lightnessStops: number[]; // L values 0..1 for columns
  chroma: number; // base C, clamped per cell to stay in gamut
  lockedHues: number[]; // indices into hues that randomize() skips
};

export type GradientStop = {
  id: string;
  color: OKLCH;
  position: number; // 0..1
};

export type GradientConfig = {
  stops: GradientStop[];
  space: InterpolationSpace;
  steps: number; // preview step count
};

export type ContrastPair = {
  fg: OKLCH;
  bg: OKLCH;
  sampleText: string;
};

export type GamutConfig = {
  slice: 'L' | 'C' | 'H';
  sliceValue: number; // interpretation depends on slice
};

export type CVDConfig = {
  type: CVDType;
};

export type ExportTarget = 'css-vars' | 'tailwind' | 'json' | 'tokens' | 'figma' | 'svg' | 'xcode';

export type StoreState = {
  version: number;
  color: OKLCH;
  palette: Palette;
  recentColors: OKLCH[];
  matrix: MatrixConfig;
  gradient: GradientConfig;
  contrast: ContrastPair;
  gamut: GamutConfig;
  cvd: CVDConfig;
  activeTab: TabId;
  theme: Theme;
  preferredFormat: ColorFormat;
};
