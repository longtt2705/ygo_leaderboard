'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ReliableAvatarProps {
    src?: string;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    name: string; // Required for generating fallback
}

export function ReliableAvatar({
    src,
    alt,
    className,
    fallbackClassName,
    name
}: ReliableAvatarProps) {
    const [avatarSrc, setAvatarSrc] = useState<string | undefined>(src);
    const [hasError, setHasError] = useState(false);

    // List of unreliable domains to avoid
    const unreliableDomains = [
        'via.placeholder.com',
        'placeholder.com',
        'placehold.it'
    ];

    useEffect(() => {
        // Reset error state when src changes
        setHasError(false);

        // Check if the source is from an unreliable domain or empty
        if (!src || src.trim() === '' || unreliableDomains.some(domain => src.includes(domain))) {
            // Use undefined to trigger fallback immediately
            setAvatarSrc(undefined);
            setHasError(true);
        } else {
            setAvatarSrc(src);
        }
    }, [src, unreliableDomains]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setAvatarSrc(undefined); // This will trigger the fallback
        }
    };

    return (
        <Avatar className={className}>
            {avatarSrc && !hasError && (
                <AvatarImage
                    src={avatarSrc}
                    alt={alt}
                    onError={handleError}
                />
            )}
            <AvatarFallback className={fallbackClassName}>
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
} 