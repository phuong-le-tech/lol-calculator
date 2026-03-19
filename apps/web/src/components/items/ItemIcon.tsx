"use client";

import { useState } from "react";
import Image from "next/image";

interface ItemIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ItemIcon({ src, alt, size = 32, className = "" }: ItemIconProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-dark-300 text-dark-50 ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>?</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}
