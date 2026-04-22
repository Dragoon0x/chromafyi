import { parseInput } from '@/color/convert';
import { formatColor } from '@/color/format';
import { toGamut, widestGamut } from '@/color/gamut';
import type { ColorFormat } from '@/color/types';
import { useCopy } from '@/hooks/useCopy';
import { useHotkey } from '@/hooks/useKeyboard';
import { useStore } from '@/store';
import { getShareableUrl } from '@/store/hash';
import type { TabId } from '@/store/types';
import { Command } from 'cmdk';
import {
  Copy,
  Eye,
  Grid3x3,
  Layers,
  LineChart,
  ListChecks,
  Moon,
  Palette as PaletteIcon,
  RefreshCcw,
  Shuffle,
  Sun,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const TAB_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'inspector', label: 'Go to Inspector', icon: <Eye size={14} /> },
  { id: 'matrix', label: 'Go to Tonal Matrix', icon: <Grid3x3 size={14} /> },
  { id: 'palette', label: 'Go to Palette', icon: <Layers size={14} /> },
  { id: 'gradient', label: 'Go to Gradient Lab', icon: <LineChart size={14} /> },
  { id: 'contrast', label: 'Go to Contrast', icon: <ListChecks size={14} /> },
  { id: 'export', label: 'Go to Export', icon: <PaletteIcon size={14} /> },
];

const FORMATS: ColorFormat[] = ['oklch', 'hex', 'rgb', 'hsl', 'oklab', 'p3', 'lab', 'lch'];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const setActive = useStore((s) => s.setActiveTab);
  const setTheme = useStore((s) => s.setTheme);
  const pickRecent = useStore((s) => s.pickRecent);
  const addSwatch = useStore((s) => s.addSwatch);
  const resetPalette = useStore((s) => s.resetPalette);
  const color = useStore((s) => s.color);
  const setColor = useStore((s) => s.setColor);
  const { copy } = useCopy();

  useHotkey({ key: 'k', meta: true }, () => setOpen((v) => !v));
  useHotkey({ key: 'k', ctrl: true }, () => setOpen((v) => !v));

  // Close on Escape handled by Command dialog itself. Close on outside click.
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  if (!open) return null;

  const parsed = parseInput(search);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div
      role="presentation"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 grid place-items-start justify-center pt-[12vh] bg-black/40 backdrop-blur-[2px] fade-in"
    >
      <Command
        label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-[min(640px,94vw)] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Search commands, or paste a color (#1e90ff, oklch(…), hsl(…))"
          className="w-full h-12 px-4 bg-transparent border-b border-[color:var(--color-border)] text-sm outline-none placeholder-[color:var(--color-text-dim)]"
          autoFocus
        />
        <Command.List className="max-h-[50vh] overflow-y-auto p-1">
          <Command.Empty className="px-3 py-6 text-center text-xs text-[color:var(--color-text-dim)]">
            No commands match.
          </Command.Empty>

          {parsed && (
            <Command.Group heading="Parsed color" forceMount>
              <Item
                forceMount
                value={search}
                icon={
                  <span
                    className="w-3.5 h-3.5 rounded-[3px] border border-black/20"
                    style={{ background: `oklch(${parsed.l} ${parsed.c} ${parsed.h})` }}
                  />
                }
                onSelect={() => run(() => pickRecent(parsed))}
              >
                Use <span className="mono ml-1">{formatColor(parsed, 'oklch')}</span>
              </Item>
            </Command.Group>
          )}

          <Command.Group heading="Navigate">
            {TAB_ITEMS.map((t) => (
              <Item key={t.id} icon={t.icon} onSelect={() => run(() => setActive(t.id))}>
                {t.label}
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Current color">
            <Item
              icon={<Copy size={14} />}
              onSelect={() =>
                run(async () => {
                  await copy(getShareableUrl(useStore.getState()));
                })
              }
            >
              Copy share URL
            </Item>
            {FORMATS.map((fmt) => (
              <Item
                key={`copy-${fmt}`}
                icon={<Copy size={14} />}
                onSelect={() =>
                  run(async () => {
                    await copy(formatColor(color, fmt));
                  })
                }
              >
                Copy as {fmt.toUpperCase()}
              </Item>
            ))}
            <Item icon={<PaletteIcon size={14} />} onSelect={() => run(() => addSwatch(color))}>
              Add current color to palette
            </Item>
            {widestGamut(color) !== 'srgb' && (
              <Item
                icon={<Zap size={14} />}
                onSelect={() => run(() => setColor(toGamut(color, 'srgb')))}
              >
                Snap current color to sRGB
              </Item>
            )}
          </Command.Group>

          <Command.Group heading="Tools">
            <Item
              icon={<Shuffle size={14} />}
              onSelect={() =>
                run(() =>
                  pickRecent({
                    l: 0.3 + Math.random() * 0.55,
                    c: Math.random() * 0.2,
                    h: Math.random() * 360,
                  }),
                )
              }
            >
              Random color
            </Item>
            <Item icon={<RefreshCcw size={14} />} onSelect={() => run(() => resetPalette())}>
              Reset palette
            </Item>
          </Command.Group>

          <Command.Group heading="Theme">
            <Item icon={<Sun size={14} />} onSelect={() => run(() => setTheme('light'))}>
              Light
            </Item>
            <Item icon={<Moon size={14} />} onSelect={() => run(() => setTheme('dark'))}>
              Dark
            </Item>
            <Item icon={<Eye size={14} />} onSelect={() => run(() => setTheme('system'))}>
              Match system
            </Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({
  icon,
  onSelect,
  value,
  forceMount,
  children,
}: {
  icon: React.ReactNode;
  onSelect: () => void;
  value?: string;
  forceMount?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={value}
      forceMount={forceMount}
      className="flex items-center gap-2.5 px-3 h-9 text-sm rounded-[var(--radius-sm)] text-[color:var(--color-text-muted)] data-[selected=true]:bg-[color:var(--color-surface-2)] data-[selected=true]:text-[color:var(--color-text)] cursor-pointer"
    >
      <span className="text-[color:var(--color-text-dim)] w-4 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 truncate">{children}</span>
    </Command.Item>
  );
}
