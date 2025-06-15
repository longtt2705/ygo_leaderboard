'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImageToCloudinary, validateImageFile } from '@/lib/cloudinary';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageChange: (imageUrl: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function ImageUpload({
    currentImageUrl,
    onImageChange,
    className = "",
    size = 'md'
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'h-16 w-16',
        md: 'h-24 w-24',
        lg: 'h-32 w-32'
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            setError(validation.error || 'Invalid file');
            return;
        }

        setError('');
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            const imageUrl = await uploadImageToCloudinary(file);
            onImageChange(imageUrl);
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload image. Please try again.');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayImageUrl = previewUrl || currentImageUrl;

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
                    {displayImageUrl ? (
                        <div className="relative group">
                            <Avatar className={`${sizeClasses[size]} border-2 border-slate-600/50`}>
                                <AvatarImage src={displayImageUrl} alt="Avatar preview" />
                                <AvatarFallback className="bg-slate-700 text-white">
                                    <ImageIcon className="h-6 w-6" />
                                </AvatarFallback>
                            </Avatar>

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={uploading}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className={`${sizeClasses[size]} border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center bg-slate-800/50`}>
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    {displayImageUrl ? 'Change Image' : 'Upload Image'}
                                </>
                            )}
                        </button>

                        {displayImageUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={uploading}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-600/50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-slate-400">
                        Supports JPEG, PNG, WebP. Max size: 5MB
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    {error}
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
} 