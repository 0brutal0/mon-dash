"use client";

import { useEffect, useState } from "react";
import NewsFeed from "@/components/NewsFeed";
import MonadNewsFeed from "@/components/MonadNewsFeed";

interface NewsItem {
  time: string;
  title: string;
  source: string;
  sourceColor: string;
  url?: string;
}

interface Props {
  general: NewsItem[];
  monad: NewsItem[];
}

export default function LiveNewsSidebar({ general, monad }: Props) {
  const [generalNews, setGeneralNews] = useState(general);
  const [monadNews, setMonadNews] = useState(monad);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (Array.isArray(json.general)) setGeneralNews(json.general);
        if (Array.isArray(json.monad)) setMonadNews(json.monad);
      } catch {
        // Keep the last rendered news if the refresh fails.
      }
    };

    const interval = setInterval(poll, 15 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <NewsFeed data={generalNews} />
      <MonadNewsFeed data={monadNews} />
    </>
  );
}
