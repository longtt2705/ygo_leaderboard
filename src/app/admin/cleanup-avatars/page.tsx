'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getAllPlayers, updatePlayer } from '@/lib/firebaseService';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CleanupAvatarsPage() {
    return (
        <ProtectedRoute>
            <CleanupAvatars />
        </ProtectedRoute>
    );
}

function CleanupAvatars() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        total: number;
        cleaned: number;
        errors: string[];
    } | null>(null);

    const cleanupPlaceholderAvatars = async () => {
        setLoading(true);
        setResults(null);

        try {
            const players = await getAllPlayers();
            const placeholderDomains = [
                'via.placeholder.com',
                'placeholder.com',
                'placehold.it'
            ];

            let cleanedCount = 0;
            const errors: string[] = [];

            for (const player of players) {
                const hasPlaceholderAvatar = player.avatar &&
                    placeholderDomains.some(domain => player.avatar.includes(domain));

                if (hasPlaceholderAvatar) {
                    try {
                        await updatePlayer(player.id, {
                            avatar: '' // Clear the placeholder URL
                        });
                        cleanedCount++;
                    } catch (error) {
                        errors.push(`Failed to update ${player.name}: ${error}`);
                    }
                }
            }

            setResults({
                total: players.length,
                cleaned: cleanedCount,
                errors
            });

        } catch (error) {
            setResults({
                total: 0,
                cleaned: 0,
                errors: [`Failed to fetch players: ${error}`]
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-4xl px-6 py-6">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Admin
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-4xl px-6 py-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Cleanup Avatar URLs</h1>
                            <p className="text-slate-400">
                                Remove placeholder URLs that are causing timeout errors and replace them with reliable fallbacks.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-amber-400 mb-1">What this does:</h3>
                                        <ul className="text-amber-200 text-sm space-y-1">
                                            <li>• Scans all players for placeholder avatar URLs</li>
                                            <li>• Removes URLs from via.placeholder.com, placeholder.com, placehold.it</li>
                                            <li>• Players will automatically get personalized fallback avatars</li>
                                            <li>• This fixes the upstream image response timed out errors</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={cleanupPlaceholderAvatars}
                                disabled={loading}
                                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-600/50 disabled:to-purple-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Cleaning up avatars...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-5 w-5" />
                                        Start Cleanup
                                    </>
                                )}
                            </button>

                            {results && (
                                <div className="bg-slate-700/30 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <h3 className="font-semibold text-white">Cleanup Results</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-white">{results.total}</div>
                                            <div className="text-sm text-slate-400">Total Players</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-green-400">{results.cleaned}</div>
                                            <div className="text-sm text-slate-400">Avatars Cleaned</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-red-400">{results.errors.length}</div>
                                            <div className="text-sm text-slate-400">Errors</div>
                                        </div>
                                    </div>

                                    {results.errors.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                            <h4 className="font-semibold text-red-400 mb-2">Errors:</h4>
                                            <ul className="text-red-300 text-sm space-y-1">
                                                {results.errors.map((error, index) => (
                                                    <li key={index}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.cleaned > 0 && (
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                                            <p className="text-green-400">
                                                ✅ Successfully cleaned {results.cleaned} placeholder avatar URLs.
                                                Players will now see personalized fallback avatars instead of timeout errors.
                                            </p>
                                        </div>
                                    )}

                                    {results.cleaned === 0 && results.errors.length === 0 && (
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                                            <p className="text-blue-400">
                                                ℹ️ No placeholder URLs found. All player avatars are already using reliable sources.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 