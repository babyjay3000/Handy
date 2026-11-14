import React, { useMemo } from "react";

// Lo-fi pixel-art speaker for the Classic overlay theme: a 30x21 grid drawn
// as crisp SVG squares in tarnished bronze-gold, with a soft one-pixel shadow
// instead of an outline. Sound waves (0-3) follow the voice; while working,
// three dots fill in instead.

const W = 30;
const H = 21;
export const PIXEL_SPEAKER_SCALE = 4; // screen pixels per grid pixel

const BASE = "rgb(192,146,54)";
const SHADE = "rgb(126,92,32)";
const SHINE = "rgb(230,190,104)";
const SHADOW = "rgba(40,28,10,0.59)";

type Pixels = Map<string, string>;
const key = (x: number, y: number) => `${x},${y}`;

function speaker(): Pixels {
  const g: Pixels = new Map();
  for (let x = 3; x < 7; x++)
    for (let y = 8; y < 13; y++) g.set(key(x, y), BASE);
  for (let i = 0; i < 5; i++) {
    const x = 7 + i;
    for (let y = 7 - i; y < 14 + i; y++) g.set(key(x, y), BASE);
  }
  for (let y = 8; y < 13; y++) g.set(key(3, y), SHADE); // left shade
  for (let i = 0; i < 5; i++) g.set(key(7 + i, 13 + i), SHADE); // underside
  for (let x = 3; x < 7; x++) g.set(key(x, 8), SHINE); // top edge shine
  for (let i = 0; i < 5; i++) g.set(key(7 + i, 7 - i), SHINE); // cone shine
  return g;
}

function waves(count: number): Pixels {
  const g: Pixels = new Map();
  const cx = 11.5;
  const cy = 10;
  for (let k = 0; k < count; k++) {
    const r = 4.5 + 4.6 * k;
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx <= 0) continue;
        if (
          Math.abs(Math.hypot(dx, dy) - r) < 0.95 &&
          Math.abs(Math.atan2(dy, dx)) < 0.8
        ) {
          g.set(key(x, y), BASE);
        }
      }
    }
  }
  return g;
}

function dots(count: number): Pixels {
  const g: Pixels = new Map();
  for (let k = 0; k < count; k++) {
    const x = 15 + 4 * k;
    for (let dx = 0; dx < 2; dx++)
      for (let dy = 0; dy < 2; dy++) g.set(key(x + dx, 10 + dy), BASE);
  }
  return g;
}

const SPEAKER = speaker();
const WAVES = [0, 1, 2, 3].map(waves);
const DOTS = [0, 1, 2, 3].map(dots);

interface PixelSpeakerProps {
  /** Number of sound waves to show (0-3). Ignored while `dotCount` is set. */
  waveCount: number;
  /** While transcribing: number of dots (1-3). */
  dotCount?: number;
  dim?: boolean;
}

export const PixelSpeaker: React.FC<PixelSpeakerProps> = ({
  waveCount,
  dotCount,
  dim = false,
}) => {
  const rects = useMemo(() => {
    const extra =
      dotCount !== undefined
        ? DOTS[Math.max(0, Math.min(3, dotCount))]
        : WAVES[Math.max(0, Math.min(3, waveCount))];
    const pixels: Pixels = new Map([...SPEAKER, ...extra]);
    const out: React.ReactElement[] = [];
    // Shadow first (down-right), only where there's no lit pixel.
    pixels.forEach((_, k) => {
      const [x, y] = k.split(",").map(Number);
      if (!pixels.has(key(x + 1, y + 1)) && x + 1 < W && y + 1 < H) {
        out.push(
          <rect
            key={`s${k}`}
            x={x + 1}
            y={y + 1}
            width={1}
            height={1}
            fill={SHADOW}
          />,
        );
      }
    });
    pixels.forEach((color, k) => {
      const [x, y] = k.split(",").map(Number);
      out.push(<rect key={k} x={x} y={y} width={1} height={1} fill={color} />);
    });
    return out;
  }, [waveCount, dotCount]);

  return (
    <svg
      className="pixel-speaker"
      width={W * PIXEL_SPEAKER_SCALE}
      height={H * PIXEL_SPEAKER_SCALE}
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      style={{ opacity: dim ? 0.55 : 1 }}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
};

/** Maps the (smoothed, 0-1) mic levels to 0-3 waves. */
export function wavesForLevels(levels: number[]): number {
  const loudest = levels.reduce((m, v) => Math.max(m, v), 0);
  if (loudest < 0.06) return 0;
  if (loudest < 0.2) return 1;
  if (loudest < 0.4) return 2;
  return 3;
}
