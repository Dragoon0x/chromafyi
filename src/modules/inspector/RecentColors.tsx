import { useStore } from '@/store';
import { Swatch } from '@/ui/Swatch';

export function RecentColors() {
  const recent = useStore((s) => s.recentColors);
  const pick = useStore((s) => s.pickRecent);

  if (recent.length === 0) {
    return (
      <div className="mono text-[11px] text-[color:var(--color-text-dim)]">
        Colors you visit will appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {recent.slice(0, 24).map((c, i) => (
        <Swatch
          key={`${c.l}-${c.c}-${c.h}-${i}`}
          color={c}
          size={24}
          rounded="sm"
          onClick={() => pick(c)}
        />
      ))}
    </div>
  );
}
