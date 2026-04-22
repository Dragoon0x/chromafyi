import { inGamut } from '@/color/gamut';
import { useStore } from '@/store';
import { Slider } from '@/ui/Slider';
import { useEffect, useRef } from 'react';

// 2D slice: chroma (y) vs hue (x) at fixed L.
// Each pixel checks gamut membership (sRGB, P3, Rec2020) and shades accordingly.

const W = 640;
const H = 300;
const MAX_C = 0.38;

export function GamutVisualizer() {
  const color = useStore((s) => s.color);
  const pick = useStore((s) => s.pickRecent);
  const gamutConfig = useStore((s) => s.gamut);
  const setGamut = useStore((s) => s.setGamut);

  const L = gamutConfig.slice === 'L' ? gamutConfig.sliceValue : color.l;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Paint slice once per L change
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      const c = ((H - 1 - y) / (H - 1)) * MAX_C;
      for (let x = 0; x < W; x++) {
        const h = (x / (W - 1)) * 360;
        const color = { l: L, c, h };
        const inSrgb = inGamut(color, 'srgb');
        const inP3 = inGamut(color, 'p3');
        const inR2020 = inGamut(color, 'rec2020');
        const idx = (y * W + x) * 4;
        if (inSrgb) {
          // Render an actual sampled color at L,C,H via simple sRGB preview
          const rgb = oklchToRgb8(color);
          img.data[idx] = rgb.r;
          img.data[idx + 1] = rgb.g;
          img.data[idx + 2] = rgb.b;
          img.data[idx + 3] = 255;
        } else if (inP3) {
          img.data[idx] = 40;
          img.data[idx + 1] = 40;
          img.data[idx + 2] = 48;
          img.data[idx + 3] = 255;
        } else if (inR2020) {
          img.data[idx] = 24;
          img.data[idx + 1] = 24;
          img.data[idx + 2] = 30;
          img.data[idx + 3] = 255;
        } else {
          img.data[idx] = 12;
          img.data[idx + 1] = 12;
          img.data[idx + 2] = 16;
          img.data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [L]);

  // Overlay: crosshair at the current color's (h, c)
  useEffect(() => {
    const cvs = overlayRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const x = (color.h / 360) * W;
    const y = H - 1 - (color.c / MAX_C) * (H - 1);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.stroke();
  }, [color.h, color.c]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cvs = overlayRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * W;
    const cy = ((e.clientY - rect.top) / rect.height) * H;
    const h = Math.max(0, Math.min(360, (cx / W) * 360));
    const c = Math.max(0, Math.min(MAX_C, ((H - 1 - cy) / (H - 1)) * MAX_C));
    pick({ l: L, c, h });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-8 space-y-5">
        <header>
          <h1 className="text-lg font-medium">Gamut</h1>
          <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
            Chroma × hue slice at fixed L. Dark bands mark colors that need P3 / Rec 2020 / are out
            of gamut.
          </p>
        </header>

        <div className="grid grid-cols-[80px_1fr_60px] items-center gap-3">
          <span className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
            Slice L
          </span>
          <Slider
            label="Slice L"
            value={L}
            min={0}
            max={1}
            step={0.005}
            onChange={(v) => setGamut({ slice: 'L', sliceValue: v })}
          />
          <span className="mono text-[11px] tabular-nums text-right">{(L * 100).toFixed(0)}%</span>
        </div>

        <div className="relative rounded-[var(--radius-md)] overflow-hidden border border-[color:var(--color-border)]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{ width: '100%', height: 'auto', display: 'block', imageRendering: 'pixelated' }}
            aria-label={`Gamut slice at L=${L.toFixed(2)}`}
          />
          <canvas
            ref={overlayRef}
            width={W}
            height={H}
            onClick={onClick}
            onMouseDown={onClick}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: 'crosshair',
            }}
            aria-label="Pick a color on the gamut"
          />
          <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between mono text-[10px] text-white/70 pointer-events-none">
            <span>0°</span>
            <span>hue →</span>
            <span>360°</span>
          </div>
          <div className="absolute top-2 left-2 mono text-[10px] text-white/70 pointer-events-none">
            ↑ chroma
          </div>
        </div>

        <ul className="flex flex-wrap gap-3 text-[11px] text-[color:var(--color-text-muted)] mono">
          <li className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-[2px] bg-gradient-to-br from-[oklch(0.8_0.15_200)] to-[oklch(0.4_0.15_330)]" />
            in sRGB (live color)
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-[2px]"
              style={{ background: '#282830' }}
            />
            P3 only
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-[2px]"
              style={{ background: '#18181e' }}
            />
            Rec 2020 only
          </li>
          <li className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-[2px]"
              style={{ background: '#0c0c10' }}
            />
            out of all
          </li>
        </ul>
      </div>
    </div>
  );
}

// Fast sRGB byte conversion for canvas pixels. Duplicates a small amount of culori math
// but avoids creating thousands of objects per frame.
function oklchToRgb8(c: { l: number; c: number; h: number }): { r: number; g: number; b: number } {
  // OKLCH → OKLab
  const hRad = (c.h * Math.PI) / 180;
  const a = c.c * Math.cos(hRad);
  const b = c.c * Math.sin(hRad);
  // OKLab → linear sRGB (Björn Ottosson)
  const l_ = c.l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = c.l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = c.l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  const gamma = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.sign(x) * Math.abs(x) ** (1 / 2.4) - 0.055;
  return {
    r: Math.round(Math.max(0, Math.min(1, gamma(r))) * 255),
    g: Math.round(Math.max(0, Math.min(1, gamma(g))) * 255),
    b: Math.round(Math.max(0, Math.min(1, gamma(bl))) * 255),
  };
}
