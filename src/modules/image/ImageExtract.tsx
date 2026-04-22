import { oklchToCssString } from '@/color/convert';
import { type OKLabPoint, kmeans } from '@/color/kmeans';
import type { OKLCH } from '@/color/types';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { Swatch } from '@/ui/Swatch';
import { converter } from 'culori';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

const toOklab = converter('oklab');
const toOklch = converter('oklch');

function extract(img: HTMLImageElement, k: number): OKLCH[] {
  const sample = 220;
  const aspect = img.naturalWidth / img.naturalHeight;
  const w = aspect >= 1 ? sample : Math.round(sample * aspect);
  const h = aspect >= 1 ? Math.round(sample / aspect) : sample;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const points: OKLabPoint[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 255;
    if (a < 128) continue;
    const r = (data[i] ?? 0) / 255;
    const g = (data[i + 1] ?? 0) / 255;
    const b = (data[i + 2] ?? 0) / 255;
    const lab = toOklab({ mode: 'rgb', r, g, b });
    points.push({ l: lab.l ?? 0, a: lab.a ?? 0, b: lab.b ?? 0 });
  }
  const centroids = kmeans(points, k, 16);
  return centroids
    .map((c) => toOklch({ mode: 'oklab', l: c.l, a: c.a, b: c.b }))
    .map((o) => ({ l: o.l ?? 0, c: o.c ?? 0, h: o.h ?? 0 }))
    .sort((a, b) => a.l - b.l);
}

export function ImageExtract() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [k, setK] = useState(6);
  const [palette, setLocalPalette] = useState<OKLCH[] | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const setPalette = useStore((s) => s.setPalette);

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBusy(true);
      const img = new Image();
      img.onload = () => {
        try {
          const p = extract(img, k);
          setLocalPalette(p);
        } finally {
          setBusy(false);
        }
      };
      img.onerror = () => setBusy(false);
      img.src = url;
    },
    [k],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const saveAsPalette = () => {
    if (!palette) return;
    setPalette({
      id: nextId(),
      name: 'From image',
      swatches: palette.map((c) => ({ id: nextId(), color: c })),
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium">Image extract</h1>
            <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
              K-means clustering in OKLab — the colors the image would pick if it could.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
              k
            </label>
            <input
              type="number"
              min={2}
              max={16}
              value={k}
              onChange={(e) =>
                setK(Math.max(2, Math.min(16, Number.parseInt(e.target.value, 10) || 6)))
              }
              className="mono h-7 w-12 px-1.5 text-xs bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] rounded-[var(--radius-sm)] outline-none"
            />
          </div>
        </header>

        <label
          htmlFor="image-input"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="block border border-dashed border-[color:var(--color-border)] rounded-[var(--radius-md)] p-10 text-center cursor-pointer hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface)] transition-colors"
        >
          <input
            id="image-input"
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Upload size={20} className="mx-auto mb-2 text-[color:var(--color-text-dim)]" />
          <div className="text-sm">Drop an image, or click to choose</div>
          <div className="text-xs text-[color:var(--color-text-dim)] mt-1">
            Runs locally. Your image never leaves your browser.
          </div>
        </label>

        {previewUrl && (
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
            <div className="rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)] aspect-square bg-[color:var(--color-surface)]">
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
                  Extracted palette
                </div>
                <Button
                  size="sm"
                  onClick={saveAsPalette}
                  disabled={!palette || busy}
                  iconLeft={<ImageIcon size={13} />}
                >
                  Save as palette
                </Button>
              </div>
              {busy && (
                <div className="text-xs text-[color:var(--color-text-dim)]">Clustering…</div>
              )}
              {!busy && palette && (
                <div className="flex flex-wrap gap-1.5">
                  {palette.map((c, i) => (
                    <div key={`${c.l}-${i}`} className="flex flex-col gap-1">
                      <Swatch color={c} size={56} rounded="md" />
                      <span className="mono text-[10px] text-[color:var(--color-text-muted)] text-center">
                        {oklchToCssString(c)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
