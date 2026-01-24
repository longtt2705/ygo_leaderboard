'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateDefaultAvatar } from '@/lib/utils';

interface SafeImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    playerName?: string; // For generating personalized fallback
}

// List of unreliable domains to avoid (moved outside component to prevent re-creation)
const UNRELIABLE_DOMAINS = [
    'via.placeholder.com',
    'placeholder.com',
    'placehold.it'
];

// List of domains that are configured in Next.js config
const CONFIGURED_DOMAINS = [
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
    'images.unsplash.com'
];

export function SafeImage({ src, alt, width, height, className, playerName }: SafeImageProps) {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [useUnoptimized, setUseUnoptimized] = useState(false);

    useEffect(() => {
        // Reset error state when src changes
        setHasError(false);
        setUseUnoptimized(false);

        // Check if the source is from an unreliable domain
        const isUnreliable = UNRELIABLE_DOMAINS.some(domain => src.includes(domain));

        if (isUnreliable || !src || src.trim() === '') {
            // Use local fallback immediately for unreliable sources
            const fallbackName = playerName || alt || 'User';
            setImageSrc(generateDefaultAvatar(fallbackName, Math.max(width, height)));
            setHasError(true);
            setUseUnoptimized(true);
        } else {
            // Check if domain is configured in Next.js
            const isConfigured = CONFIGURED_DOMAINS.some(domain => src.includes(domain));
            setImageSrc(src);
            setUseUnoptimized(!isConfigured); // Use unoptimized for external domains
        }
    }, [src, alt, playerName, width, height]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            const fallbackName = playerName || alt || 'User';
            setImageSrc(generateDefaultAvatar(fallbackName, Math.max(width, height)));
            setUseUnoptimized(true);
        }
    };

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={handleError}
            unoptimized={useUnoptimized}
        />
    );
} 