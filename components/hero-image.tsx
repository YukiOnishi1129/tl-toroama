"use client";

import { useRef, useEffect } from "react";

interface HeroImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

export function HeroImage({ src, alt, className }: HeroImageProps) {
  const fallback = "https://placehold.co/800x450/fff8f6/8b7d72?text=No+Image";
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    // ハイドレーション前に既にエラーが起きていた場合をキャッチ
    if (el.complete && el.naturalWidth === 0) {
      el.src = fallback;
    }
  }, []);

  return (
    <img
      ref={imgRef}
      src={src || fallback}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
}
