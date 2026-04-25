"use client";

import { useState, CSSProperties } from "react";

interface Bar {
  height: number; // 0-100
  color?: string;
  opacity?: number;
  tip: string;
}

interface Props {
  bars: Bar[];
  chartHeight?: number;
  variant?: "bar" | "spark";
  barWidth?: number;
  barGap?: number;
  rowMaxWidth?: number | string;
  style?: CSSProperties;
}

export default function BarChart({
  bars,
  chartHeight = 60,
  variant = "bar",
  barWidth,
  barGap,
  rowMaxWidth,
  style,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const barClass = variant === "spark" ? "spark-bar" : "bar";
  const containerClass = variant === "spark" ? "sparkline" : "bar-chart";
  const resolvedBarWidth = barWidth ?? (variant === "spark" ? 5 : 9);
  const resolvedBarGap = barGap ?? (variant === "spark" ? 2 : 3);

  return (
    <div
      className={containerClass}
      style={{ position: "relative", height: chartHeight, ...style }}
    >
      <div
        className={`${containerClass}-bars`}
        style={{
          "--bar-width": `${resolvedBarWidth}px`,
          "--bar-gap": `${resolvedBarGap}px`,
          maxWidth: rowMaxWidth,
        } as CSSProperties}
      >
        {bars.map((b, i) => (
          <div
            key={i}
            className={barClass}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            style={{
              height: `${b.height}%`,
              background: b.color,
              opacity: b.opacity,
              filter: hovered === i ? "brightness(1.5)" : undefined,
              outline:
                hovered === i ? "1px solid var(--color-text-primary)" : undefined,
              cursor: "default",
            }}
          />
        ))}

        {hovered !== null && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 4px)",
              left: `${((hovered + 0.5) / bars.length) * 100}%`,
              transform: "translateX(-50%)",
              background: "#000",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "3px 6px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10000,
            }}
          >
            {bars[hovered].tip}
          </div>
        )}
      </div>
    </div>
  );
}
