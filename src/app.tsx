import { useGoToChord } from '@/hooks/useGoToChord';
import { CommandPalette } from '@/shell/CommandPalette';
import { LeftRail } from '@/shell/LeftRail';
import { ShortcutsSheet } from '@/shell/ShortcutsSheet';
import { StatusBar } from '@/shell/StatusBar';
import { ThemeController } from '@/shell/ThemeController';
import { Workspace } from '@/shell/Workspace';
import { useStore } from '@/store';
import { useEffect } from 'react';

export function App() {
  const hydrateFromHash = useStore((s) => s.hydrateFromHash);
  useGoToChord();

  useEffect(() => {
    const onHashChange = () => hydrateFromHash();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [hydrateFromHash]);

  return (
    <div className="h-full flex flex-col">
      <ThemeController />
      <div className="flex-1 min-h-0 flex">
        <LeftRail />
        <Workspace />
      </div>
      <StatusBar />
      <CommandPalette />
      <ShortcutsSheet />
    </div>
  );
}
