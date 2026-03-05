/**
 * Full-width horizontal band with 7 chunky geometric SVG shapes
 * inspired by Mapuche and Diaguita indigenous art from Chile.
 * Forms a continuous border between hero and the next section.
 */

const COLORS = {
  blue: "#3B82F6",
  pink: "#EC4899",
  lime: "#84CC16",
  yellow: "#FBBF24",
  red: "#EF4444",
  amber: "#F59E0B",
  cyan: "#06B6D4",
} as const;

/* 1. Large stepped pyramid */
function SteppedPyramid({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path
        d="M0 64h16V48h16V32h16V16h16V0h0v64H0z"
        fill={fill}
      />
    </svg>
  );
}

/* 2. Thick bold cross */
function ThickCross({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path
        d="M24 0h16v20h20v24h-20v20h-16v-20H0V20h24V0z"
        fill={fill}
      />
    </svg>
  );
}

/* 3. Square with dark circle inside (FIFA poster style) */
function SquareWithCircle({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <rect width="64" height="64" fill={fill} />
      <circle cx="32" cy="32" r="18" fill="#1e1b4b" />
    </svg>
  );
}

/* 4. Giant zigzag */
function GiantZigzag({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path
        d="M0 32L16 0h16l16 32-16 32H16L0 32z"
        fill={fill}
      />
    </svg>
  );
}

/* 5. Bold diamond */
function BoldDiamond({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path d="M32 0L64 32 32 64 0 32 32 0z" fill={fill} />
    </svg>
  );
}

/* 6. Stepped rectangles band */
function SteppedBand({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path
        d="M0 48h16V32h16V16h16V0h16v64H0V48z"
        fill={fill}
      />
    </svg>
  );
}

/* 7. Stepped diamond */
function SteppedDiamond({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full flex-shrink-0" preserveAspectRatio="none">
      <path
        d="M32 4l8 12 8 20-8 12-8 12-8-12-8-20 8-12 8-12z"
        fill={fill}
      />
    </svg>
  );
}

export function SectionDivider() {
  const shapes = [
    { Component: SteppedPyramid, fill: COLORS.blue },
    { Component: ThickCross, fill: COLORS.pink },
    { Component: SquareWithCircle, fill: COLORS.lime },
    { Component: GiantZigzag, fill: COLORS.yellow },
    { Component: BoldDiamond, fill: COLORS.red },
    { Component: SteppedBand, fill: COLORS.amber },
    { Component: SteppedDiamond, fill: COLORS.cyan },
  ];

  return (
    <div className="w-full h-20 md:h-24 overflow-hidden flex flex-row bg-[#1e1b4b]">
      {shapes.map(({ Component, fill }, i) => (
        <div key={i} className="flex-1 min-w-0 flex items-stretch">
          <Component fill={fill} />
        </div>
      ))}
    </div>
  );
}
