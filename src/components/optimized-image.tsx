'use client'

import { useState, useCallback } from 'react'
import Image, { type ImageProps } from 'next/image'

// Base64 placeholder SVG for broken/missing images
const FALLBACK_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Q0QUYzNyIgZm9udC1zaXplPSIyMCI+8J+RgDwvdGV4dD48L3N2Zz4='

// Avatar placeholder SVG
const AVATAR_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjMyIiB5PSIzNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Q0QUYzNyIgZm9udC1zaXplPSIyMCI+8J+OpzwvdGV4dD48L3N2Zz4='

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackType?: 'default' | 'avatar'
}

/**
 * Checks if a URL is a data: URL (which Next.js Image doesn't support well)
 */
function isDataUrl(src: string): boolean {
  return src.startsWith('data:')
}

/**
 * OptimizedImage — Next.js Image wrapper with:
 * - Automatic WebP conversion via Next.js
 * - Lazy loading by default
 * - Graceful fallback for broken images
 * - Solid background placeholder to prevent layout shift
 * - Handles data: URLs by falling back to <img> tag
 */
export function OptimizedImage({
  src,
  alt,
  fallbackType = 'default',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)

  const fallbackSrc = fallbackType === 'avatar' ? AVATAR_SVG : FALLBACK_SVG

  // Handle empty/missing src
  if (!src || (typeof src === 'string' && !src.trim())) {
    // Use plain <img> for data: URL fallbacks
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={props.fill ? { position: 'absolute', inset: 0 } : undefined}
      />
    )
  }

  // Handle data: URLs — Next.js Image doesn't support these
  if (typeof src === 'string' && isDataUrl(src)) {
    return (
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        style={props.fill ? { position: 'absolute', inset: 0, objectFit: props.style?.objectFit || 'cover' } : undefined}
        loading="lazy"
      />
    )
  }

  // Handle error state — use plain <img> for fallback data: URLs
  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={props.fill ? { position: 'absolute', inset: 0 } : undefined}
      />
    )
  }

  // Normal Next.js Image for valid HTTP(S) URLs
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  )
}

/**
 * SimpleImg — For images that need to use <img> (e.g., in contexts where
 * Next.js Image doesn't work like cross-origin or data: URLs).
 * This component is used as a bridge during migration.
 */
export function SimpleImg({
  src,
  alt,
  className = '',
  fallbackType = 'default',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackType?: 'default' | 'avatar' }) {
  const [imgSrc, setImgSrc] = useState(src || (fallbackType === 'avatar' ? AVATAR_SVG : FALLBACK_SVG))

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setImgSrc(fallbackType === 'avatar' ? AVATAR_SVG : FALLBACK_SVG)
      }}
      {...props}
    />
  )
}
