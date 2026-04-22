import { oklchToCssString } from '@/color/convert';
import type { OKLCH } from '@/color/types';
import { useStore } from '@/store';
import { nextId } from '@/store/defaults';
import { Button } from '@/ui/Button';
import { Swatch } from '@/ui/Swatch';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type WorkerResponse =
  | { id: string; ok: true; palette: OKLCH[] }
  | { id: string; ok: false; error: string };

function imageToRgbaBuffer(img: HTMLImageElement): Uint8ClampedArray | null {
  const sample = 220;
  const aspect = img.naturalWidth / img.naturalHeight;
  const w = aspect >= 1 ? sample : Math.round(sample * aspect);
  const h = aspect >= 1 ? Math.round(sample / aspect) : sample;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

export function ImageExtract() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [k, setK] = useState(6);
  const [palette, setLocalPalette] = useState<OKLCH[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const setPalette = useStore((s) => s.setPalette);

  const workerRef = useRef<Worker | null>(null);
  const pendingId = useRef<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('@/workers/image-extract.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    const onMessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.id !== pendingId.current) return;
      if (e.data.ok) {
        setLocalPalette(e.data.palette);
        setError(null);
      } else {
        setError(e.data.error);
      }
      setBusy(false);
    };
    worker.addEventListener('message', onMessage);
    return () => {
      worker.removeEventListener('message', onMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBusy(true);
      setError(null);
      const img = new Image();
      img.onload = () => {
        const buf = imageToRgbaBuffer(img);
        if (!buf || !workerRef.current) {
          setBusy(false);
          setError('Could not read image.');
          return;
        }
        const id = nextId();
        pendingId.current = id;
        workerRef.current.postMessage({ id, data: buf, k }, [buf.buffer]);
      };
      img.onerror = () => {
        setBusy(false);
        setError('Failed to decode image.');
      };
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
              K-means clustering in OKLab — runs off main thread.
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

        {error && (
          <div
            role="alert"
            className="text-sm text-[color:var(--color-danger)] px-3 py-2 border border-[color:var(--color-danger)] rounded-[var(--radius-sm)]"
          >
            {error}
          </div>
        )}

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
