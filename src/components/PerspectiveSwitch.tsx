'use client';

import { useState, useEffect } from 'react';
import type { Conflict } from '@/lib/conflicts';
import type { ArticleFrontmatter } from '@/lib/content';

interface Props {
  conflict: Conflict;
  sideAContent: React.ReactNode;
  sideBContent: React.ReactNode;
  sideAMeta: ArticleFrontmatter;
  sideBMeta: ArticleFrontmatter;
}

export default function PerspectiveSwitch({
  conflict,
  sideAContent,
  sideBContent,
  sideAMeta,
}: Props) {
  const storageKey = `perspective-${conflict.slug}-${sideAMeta.slug}`;
  const [active, setActive] = useState<'A' | 'B'>('A');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'A' || saved === 'B') {
      setActive(saved);
    } else {
      const random: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
      setActive(random);
    }
    setHydrated(true);
  }, [storageKey]);

  const toggle = () => {
    const next: 'A' | 'B' = active === 'A' ? 'B' : 'A';
    setActive(next);
    localStorage.setItem(storageKey, next);
  };

  const activeSide = active === 'A' ? conflict.sideA : conflict.sideB;
  const inactiveSide = active === 'A' ? conflict.sideB : conflict.sideA;

  return (
    <div>
      {/* Sticky perspective bar */}
      <div
        className="sticky top-0 z-30 py-3 px-4 shadow-md transition-colors duration-300"
        style={{ backgroundColor: activeSide.color }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <span className="text-white font-semibold flex items-center gap-2 text-sm">
            <span className="text-xl">{activeSide.flag}</span>
            <span className="hidden sm:inline">{activeSide.label}</span>
          </span>

          {/* Toggle */}
          <button
            onClick={toggle}
            aria-label={`Switch to ${inactiveSide.label}`}
            className="flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-all rounded-full px-4 py-1.5 cursor-pointer select-none"
          >
            <span className="text-sm font-bold text-white" style={{ opacity: active === 'A' ? 1 : 0.55 }}>
              {conflict.sideA.flag} {conflict.sideA.name}
            </span>

            <div className="relative w-11 h-6 rounded-full bg-white/30 flex-shrink-0">
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                style={{ transform: active === 'A' ? 'translateX(2px)' : 'translateX(22px)' }}
              />
            </div>

            <span className="text-sm font-bold text-white" style={{ opacity: active === 'B' ? 1 : 0.55 }}>
              {conflict.sideB.name} {conflict.sideB.flag}
            </span>
          </button>

          <span className="text-white/70 text-xs hidden sm:block">
            {conflict.title}
          </span>
        </div>
      </div>

      {/* Article content — both in DOM, toggled by CSS for SEO */}
      <div className={hydrated && active === 'B' ? 'hidden' : 'block'}>
        <div className="article-content">{sideAContent}</div>
      </div>
      <div className={hydrated && active === 'A' ? 'hidden' : 'block'}>
        <div className="article-content">{sideBContent}</div>
      </div>
    </div>
  );
}
