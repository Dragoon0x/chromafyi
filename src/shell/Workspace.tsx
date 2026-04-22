import { Inspector } from '@/modules/inspector/Inspector';
import { useStore } from '@/store';
import { Suspense, lazy } from 'react';

const Matrix = lazy(() => import('@/modules/matrix/Matrix').then((m) => ({ default: m.Matrix })));
const PaletteBuilder = lazy(() =>
  import('@/modules/palette/PaletteBuilder').then((m) => ({ default: m.PaletteBuilder })),
);
const GradientLab = lazy(() =>
  import('@/modules/gradient/GradientLab').then((m) => ({ default: m.GradientLab })),
);
const ExportStudio = lazy(() =>
  import('@/modules/export/ExportStudio').then((m) => ({ default: m.ExportStudio })),
);
const ContrastChecker = lazy(() =>
  import('@/modules/contrast/ContrastChecker').then((m) => ({ default: m.ContrastChecker })),
);
const GamutVisualizer = lazy(() =>
  import('@/modules/gamut/GamutVisualizer').then((m) => ({ default: m.GamutVisualizer })),
);
const CVDSimulator = lazy(() =>
  import('@/modules/cvd/CVDSimulator').then((m) => ({ default: m.CVDSimulator })),
);
const ImageExtract = lazy(() =>
  import('@/modules/image/ImageExtract').then((m) => ({ default: m.ImageExtract })),
);
const BulkConverter = lazy(() =>
  import('@/modules/bulk/BulkConverter').then((m) => ({ default: m.BulkConverter })),
);

export function Workspace() {
  const tab = useStore((s) => s.activeTab);
  return (
    <main className="flex-1 min-w-0 relative">
      <div key={tab} className="h-full fade-in">
        <Suspense
          fallback={
            <div className="h-full grid place-items-center text-xs text-[color:var(--color-text-dim)]">
              loading…
            </div>
          }
        >
          {tab === 'inspector' && <Inspector />}
          {tab === 'matrix' && <Matrix />}
          {tab === 'palette' && <PaletteBuilder />}
          {tab === 'gradient' && <GradientLab />}
          {tab === 'contrast' && <ContrastChecker />}
          {tab === 'gamut' && <GamutVisualizer />}
          {tab === 'cvd' && <CVDSimulator />}
          {tab === 'image' && <ImageExtract />}
          {tab === 'bulk' && <BulkConverter />}
          {tab === 'export' && <ExportStudio />}
        </Suspense>
      </div>
    </main>
  );
}
