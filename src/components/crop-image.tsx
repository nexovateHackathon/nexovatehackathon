"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  query: string;
  width?: number;
  height?: number;
  fill?: boolean;
  alt: string;
  className?: string;
};

export function CropImage({ query, width, height, fill, alt, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ query, w: String(width || 400), h: String(height || 300) });
    fetch(`/api/crop-image?${params.toString()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => setSrc(d.url))
      .catch(() => {
        setSrc(`https://source.unsplash.com/featured/${width || 400}x${height || 300}/?${encodeURIComponent(query)}`);
      });
    return () => controller.abort();
  }, [query, width, height]);

  if (!src) return null;

  const commonProps = {
    alt,
    className,
    unoptimized: true,
    onError: (e: any) => {
      const img = e.currentTarget as any;
      if (!img.dataset.fallback) {
        img.dataset.fallback = 'loremflickr';
        img.src = `https://loremflickr.com/${width || 400}/${height || 300}/${encodeURIComponent(query)}`;
      } else if (img.dataset.fallback === 'loremflickr') {
        img.dataset.fallback = 'picsum';
        img.src = `https://picsum.photos/seed/${encodeURIComponent(query)}/${width || 400}/${height || 300}`;
      }
    }
  } as const;

  return fill ? (
    <Image src={src} fill {...commonProps} />
  ) : (
    <Image src={src} width={width} height={height} {...commonProps} />
  );
}


