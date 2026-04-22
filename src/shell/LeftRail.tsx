import { useStore } from '@/store';
import type { TabId } from '@/store/types';
import {
  Beaker,
  Boxes,
  Download,
  Eye,
  Grid3x3,
  Image as ImageIcon,
  Layers,
  LineChart,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

type TabMeta = {
  id: TabId;
  label: string;
  icon: ReactNode;
  hint: string;
};

const TABS: TabMeta[] = [
  { id: 'inspector', label: 'Inspector', icon: <Eye size={16} />, hint: 'g i' },
  { id: 'matrix', label: 'Matrix', icon: <Grid3x3 size={16} />, hint: 'g m' },
  { id: 'palette', label: 'Palette', icon: <Layers size={16} />, hint: 'g p' },
  { id: 'gradient', label: 'Gradient', icon: <LineChart size={16} />, hint: 'g g' },
  { id: 'contrast', label: 'Contrast', icon: <ListChecks size={16} />, hint: 'g c' },
  { id: 'gamut', label: 'Gamut', icon: <Boxes size={16} />, hint: 'g u' },
  { id: 'cvd', label: 'CVD', icon: <Sparkles size={16} />, hint: 'g v' },
  { id: 'image', label: 'Image', icon: <ImageIcon size={16} />, hint: 'g h' },
  { id: 'bulk', label: 'Bulk', icon: <Beaker size={16} />, hint: 'g b' },
  { id: 'export', label: 'Export', icon: <Download size={16} />, hint: 'g e' },
];

export function LeftRail() {
  const active = useStore((s) => s.activeTab);
  const setActive = useStore((s) => s.setActiveTab);
  return (
    <nav
      aria-label="Modules"
      className="w-[208px] shrink-0 border-r border-[color:var(--color-border)] flex flex-col"
    >
      <div className="px-4 py-5 flex items-center gap-2 border-b border-[color:var(--color-border)]">
        <div
          aria-hidden="true"
          className="w-6 h-6 rounded-[6px]"
          style={{
            background:
              'conic-gradient(from 0deg, oklch(0.78 0.17 30), oklch(0.78 0.17 90), oklch(0.78 0.17 150), oklch(0.78 0.17 210), oklch(0.78 0.17 270), oklch(0.78 0.17 330), oklch(0.78 0.17 30))',
          }}
        />
        <span className="text-sm font-medium">chroma.fyi</span>
        <span
          className="ml-auto mono text-[10px] text-[color:var(--color-text-dim)] uppercase tracking-wider"
          aria-hidden="true"
        >
          OKLCH
        </span>
      </div>
      <ul className="flex-1 overflow-y-auto py-2 px-2 space-y-[2px]">
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActive(t.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group w-full flex items-center gap-2.5 h-8 px-2 rounded-[var(--radius-sm)] text-sm transition-colors ${
                  isActive
                    ? 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]'
                    : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]'
                }`}
              >
                <span
                  className={
                    isActive
                      ? 'text-[color:var(--color-accent)]'
                      : 'text-[color:var(--color-text-dim)] group-hover:text-[color:var(--color-text-muted)]'
                  }
                >
                  {t.icon}
                </span>
                <span>{t.label}</span>
                <span className="ml-auto mono text-[10px] text-[color:var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {t.hint}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="px-3 py-3 border-t border-[color:var(--color-border)] text-[11px] text-[color:var(--color-text-dim)] space-y-1">
        <div className="flex justify-between">
          <span>⌘K</span>
          <span>palette</span>
        </div>
        <div className="flex justify-between">
          <span>?</span>
          <span>shortcuts</span>
        </div>
      </div>
    </nav>
  );
}
