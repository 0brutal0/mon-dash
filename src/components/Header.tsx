"use client";

import { useState, useEffect, useRef } from "react";
import { PRICE_DATA } from "@/data/constants";
import { formatPct } from "@/lib/format";

interface TickerData {
  price: number;
  change24h: number;
  change30d?: number;
  changeAbs: number;
  marketCap: string;
  volume24h: string;
  fdv: string;
  openInterest?: string | null;
}

interface Props {
  data?: typeof PRICE_DATA;
}

export default function Header({ data }: Props) {
  const initial = data ?? PRICE_DATA;
  const [ticker, setTicker] = useState<TickerData>(initial as TickerData);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [mounted, setMounted] = useState(false);
  const prevPriceRef = useRef<number>(initial.price as number);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), 0);

    const poll = async () => {
      try {
        const res = await fetch("/api/ticker");
        if (!res.ok) return;
        const json = await res.json();
        const next: TickerData = json.ticker;
        if (!next) return;

        setTicker((current) => ({
          ...current,
          ...next,
          openInterest: next.openInterest ?? current.openInterest,
        }));

        const prev = prevPriceRef.current;
        if (next.price !== prev) {
          const dir = next.price > prev ? "up" : "down";
          setFlash(dir);
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          flashTimerRef.current = setTimeout(() => setFlash(null), 900);
          prevPriceRef.current = next.price;
        }
      } catch {
        // silently ignore — keep showing last known data
      }
    };

    const interval = setInterval(poll, 60_000);
    return () => {
      clearTimeout(mountTimer);
      clearInterval(interval);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const isUp = ticker.change24h >= 0;
  const is30dUp = (ticker.change30d ?? 0) >= 0;

  const priceColor =
    flash === "up"
      ? "var(--color-pos-green)"
      : flash === "down"
      ? "var(--color-neg-red)"
      : undefined;

  const tickerItems = (
    <>
      <div className="ticker-item">
        <span className="ticker-label">TOKEN</span>
        <span className="bold text-amber">MON</span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">PRICE</span>
        <span
          className={
            flash === "up"
              ? "price-flash-up"
              : flash === "down"
              ? "price-flash-down"
              : undefined
          }
          style={priceColor ? { color: priceColor } : undefined}
        >
          ${ticker.price}
        </span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">24H</span>
        <span className={isUp ? "text-green" : "text-red"}>
          {formatPct(ticker.change24h)}
        </span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">30D</span>
        <span className={is30dUp ? "text-green" : "text-red"}>
          {formatPct(ticker.change30d ?? 0)}
        </span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">OI</span>
        <span>{ticker.openInterest ?? "N/A"}</span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">MCAP</span>
        <span>{ticker.marketCap}</span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">VOL</span>
        <span>{ticker.volume24h}</span>
      </div>

      <div className="ticker-item">
        <span className="ticker-label">FDV</span>
        <span>{ticker.fdv}</span>
      </div>
    </>
  );

  return (
    <div id="ticker">
      <div className="ticker-track">
        {Array.from({ length: mounted ? 6 : 1 }, (_, i) => (
          <div key={i} className="ticker-loop" aria-hidden={i === 0 ? undefined : "true"}>
            {tickerItems}
          </div>
        ))}
      </div>
    </div>
  );
}
