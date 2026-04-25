"use client";

import { useState, useEffect, useRef } from "react";
import { NETWORK_DATA, URLS } from "@/data/constants";

interface NetworkProps {
  blockHeight: string;
  tps: string;
  finality: string;
  blockTime: string;
  activeValidators: number;
  totalValidators: number;
  parallelExecRatio: number;
  gasPrice?: string | null;
}

interface Props {
  data?: NetworkProps;
}

interface LiveData {
  blockHeight: string | null;
  tps: string | null;
  gasPrice: string | null;
}

function useFlash(value: string | null | undefined) {
  const [flashing, setFlashing] = useState(false);
  const prev = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value && value !== prev.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlashing(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setFlashing(false), 600);
      prev.current = value;
    }
  }, [value]);

  return flashing;
}

export default function NetworkStatus({ data }: Props) {
  const d: NetworkProps = data ?? NETWORK_DATA;
  const [live, setLive] = useState<LiveData>({
    blockHeight: null,
    tps: null,
    gasPrice: null,
  });

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/network");
        if (!res.ok) return;
        const json: LiveData = await res.json();
        setLive(json);
      } catch {
        // keep last known values
      }
    };

    poll(); // immediate first fetch
    const interval = setInterval(poll, 15_000);
    return () => clearInterval(interval);
  }, []);

  const blockHeight = live.blockHeight ?? d.blockHeight;
  const tps = live.tps ?? d.tps;
  const gasPrice = live.gasPrice ?? d.gasPrice;

  const blockFlash = useFlash(live.blockHeight);
  const tpsFlash = useFlash(live.tps);
  const gasFlash = useFlash(live.gasPrice);

  // Strip leading # for the Monadscan link
  const blockNum = blockHeight.replace(/^#/, "").replace(/,/g, "");

  return (
    <>
      <style>{`
        @keyframes val-flash {
          0%   { color: var(--color-accent-cyan); }
          100% { color: inherit; }
        }
        .val-flash { animation: val-flash 0.6s ease-out forwards; }
      `}</style>

      <div className="col-12 status-strip">
        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Height</span>
          <a
            href={URLS.monadscanBlock(blockNum)}
            target="_blank"
            rel="noopener noreferrer"
            className={`ext-link${blockFlash ? " val-flash" : " text-cyan"}`}
          >
            {blockHeight}
          </a>
        </div>

        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Realtime TPS</span>
          <span className={tpsFlash ? "val-flash" : undefined}>
            {tps}{" "}
            <span className="text-green" style={{ fontSize: 10 }}>▲</span>
          </span>
        </div>

        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Block Time</span>
          <span>{d.blockTime}</span>
        </div>

        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Finality</span>
          <span>{d.finality}</span>
        </div>

        {gasPrice && (
          <div className="status-group">
            <span className="text-muted uppercase" style={{ fontSize: 10 }}>Gas</span>
            <span className={gasFlash ? "val-flash" : undefined}>{gasPrice}</span>
          </div>
        )}

        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Parallel Exec</span>
          <span>{d.parallelExecRatio}%</span>
        </div>

        <div className="status-group">
          <span className="text-muted uppercase" style={{ fontSize: 10 }}>Validators</span>
          <span>{d.activeValidators} / {d.totalValidators}</span>
        </div>

      </div>
    </>
  );
}
