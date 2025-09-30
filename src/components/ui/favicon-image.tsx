"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  getFaviconWithFallback,
  markFaviconSuccessful,
  markFaviconFailed,
} from "@/lib/favicon";
import { cn } from "@/lib/utils";

interface FaviconImageProps {
  url: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}

export function FaviconImage({
  url,
  alt,
  size = 32,
  className,
  fallbackText,
}: FaviconImageProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [faviconData, setFaviconData] = useState(() =>
    getFaviconWithFallback(url, size)
  );

  // Update favicon data when URL changes
  useEffect(() => {
    setFaviconData(getFaviconWithFallback(url, size));
    setCurrentSourceIndex(0);
    setHasError(false);
  }, [url, size]);

  const allSources = [faviconData.primary, ...faviconData.fallbacks];

  // Get current source to try
  const currentSource =
    allSources[currentSourceIndex] || faviconData.localFallback;
  const isLocalFallback = currentSourceIndex >= allSources.length;

  const handleError = useCallback(() => {
    if (currentSourceIndex < allSources.length - 1) {
      // Try next fallback
      setCurrentSourceIndex((prev) => prev + 1);
      setHasError(false);
    } else {
      // All sources failed, mark as failed and use local fallback
      markFaviconFailed(url);
      setHasError(true);
    }
  }, [currentSourceIndex, allSources.length, url]);

  const handleLoad = useCallback(() => {
    // Mark this URL as successful in cache
    if (!isLocalFallback) {
      markFaviconSuccessful(url, currentSource);
    }
    setHasError(false);
  }, [url, currentSource, isLocalFallback]);

  // If we've exhausted all sources or there's an error, show local fallback
  if (hasError || isLocalFallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-xs font-medium overflow-hidden",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={faviconData.localFallback}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          unoptimized // For SVG data URLs
        />
      </div>
    );
  }

  return (
    <Image
      src={currentSource}
      alt={alt}
      width={size}
      height={size}
      className={cn("w-full h-full object-contain", className)}
      onError={handleError}
      onLoad={handleLoad}
      // Disable Next.js optimization for external favicons to avoid CORS issues
      unoptimized={!currentSource.startsWith("/")}
    />
  );
}

// Cursor rules applied correctly.
