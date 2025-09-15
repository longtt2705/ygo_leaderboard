'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateDefaultAvatar } from '@/lib/utils';

interface UniversalImageProps {
    src?: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    playerName?: string;
    fallbackInitial?: string;
}

export function UniversalImage({
    src,
    alt,
    width,
    height,
    className,
    playerName,
    fallbackInitial
}: UniversalImageProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);

    // List of unreliable domains to avoid
    const unreliableDomains = [
        'via.placeholder.com',
        'placeholder.com',
        'placehold.it'
    ];

    // Generate fallback avatar
    const generateFallback = () => {
        const name = playerName || fallbackInitial || alt || 'User';
        return generateDefaultAvatar(name, Math.max(width, height));
    };

    useEffect(() => {
        setHasError(false);
        setLoading(true);

        // If no src or unreliable domain, use fallback immediately
        if (!src || src.trim() === '' || unreliableDomains.some(domain => src.includes(domain))) {
            setImageSrc(generateFallback());
            setHasError(true);
            setLoading(false);
            return;
        }

        // Test if the image can be loaded
        const img = new window.Image();
        img.onload = () => {
            setImageSrc(src);
            setLoading(false);
        };
        img.onerror = () => {
            setImageSrc(generateFallback());
            setHasError(true);
            setLoading(false);
        };
        img.src = src;

        // Cleanup
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, playerName, fallbackInitial, alt, width, height, generateFallback, unreliableDomains]);

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc(generateFallback());
        }
    };

    if (loading) {
        return (
            <div
                className={`${className} bg-slate-700 animate-pulse flex items-center justify-center`}
                style={{ width, height }}
            >
                <div className="text-slate-400 text-xs">Loading...</div>
            </div>
        );
    }

    return (
        <Image
            src={imageSrc || generateFallback()}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={handleImageError}
            unoptimized={true} // Always use unoptimized for maximum compatibility
            priority={false}
        />
    );
} 