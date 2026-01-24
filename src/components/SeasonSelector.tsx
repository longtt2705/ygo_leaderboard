'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Trophy, History } from 'lucide-react';
import { getAllSeasons, getCurrentSeasonNumber } from '@/lib/firebaseService';
import { SeasonSnapshot, PlayerTier } from '@/types';

interface SeasonSelectorProps {
    onSeasonChange: (seasonId: string | null) => void;
    selectedSeasonId: string | null;
    className?: string;
}

export default function SeasonSelector({ onSeasonChange, selectedSeasonId, className = '' }: SeasonSelectorProps) {
    const [seasons, setSeasons] = useState<SeasonSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState(1);

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                setLoading(true);

                // Try to get real seasons first
                let seasonsData;
                let currentNumber;

                try {
                    [seasonsData, currentNumber] = await Promise.all([
                        getAllSeasons(),
                        getCurrentSeasonNumber()
                    ]);
                    console.log('Loaded seasons from Firebase:', seasonsData.length);
                } catch {
                    console.log('Firebase not available, using fallback data for demo');
                    // Create mock season data for demonstration
                    seasonsData = [
                        {
                            id: 'demo-season-1',
                            seasonNumber: 1,
                            seasonName: 'Demo Season 1',
                            startDate: new Date('2024-01-01'),
                            endDate: new Date('2024-03-31'),
                            topPlayer: {
                                id: 'demo-champion',
                                name: 'Demo Champion',
                                elo: 2000,
                                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=champion',
                                rank: 1,
                                wins: 25,
                                losses: 5,
                                winRate: 83.3,
                                tier: 'grandmaster' as PlayerTier,
                                locals: [],
                                decks: [{ archetypeId: 'demo-1', archetypeName: 'Blue-Eyes White Dragon', isMain: true }],
                                mainDeck: 'Blue-Eyes White Dragon',
                                totalMatches: 30,
                                streak: 5,
                                peakElo: 2000,
                                recentMatches: []
                            },
                            leaderboardStats: {
                                totalPlayers: 25,
                                totalMatches: 150,
                                averageElo: 1600,
                                topPlayerElo: 2000,
                                mostPlayedDeck: 'Blue-Eyes White Dragon'
                            },
                            players: [],
                            matches: [],
                            createdAt: new Date()
                        }
                    ] as SeasonSnapshot[];
                    currentNumber = 2;
                }

                setSeasons(seasonsData);
                setCurrentSeasonNumber(currentNumber);
            } catch (error) {
                console.error('Error fetching seasons:', error);
                // Fallback to empty state
                setSeasons([]);
                setCurrentSeasonNumber(1);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasons();
    }, []);

    const handleSeasonSelect = (seasonId: string | null) => {
        console.log('Season selected:', seasonId);
        onSeasonChange(seasonId);
        setIsOpen(false);
    };

    // Create options: Current Season + Historical Seasons
    const currentSeasonOption = {
        id: null,
        label: `Current Season ${currentSeasonNumber}`,
        subtitle: 'Live Rankings',
        icon: <Trophy className="h-4 w-4 text-green-400" />,
        isLive: true
    };

    const historicalSeasonOptions = seasons.map(season => ({
        id: season.id,
        label: season.seasonName,
        subtitle: `Champion: ${season.topPlayer?.name || 'N/A'} (${season.leaderboardStats.totalPlayers} players)`,
        icon: <History className="h-4 w-4 text-blue-400" />,
        isLive: false,
        endDate: season.endDate
    }));

    const allOptions = [currentSeasonOption, ...historicalSeasonOptions];

    // Find selected option
    const selectedOption = allOptions.find(option => option.id === selectedSeasonId) || currentSeasonOption;

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-11 bg-slate-700 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ zIndex: 1000 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-slate-500/50 rounded-lg transition-all duration-200 text-left"
                style={{ position: 'relative', zIndex: 1001 }}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {selectedOption.icon}
                            <span className="font-medium text-white text-sm truncate">
                                {selectedOption.label}
                            </span>
                            {selectedOption.isLive && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-green-400 text-xs font-medium">LIVE</span>
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                            {selectedOption.subtitle}
                        </div>
                    </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 60000 }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                            zIndex: 60001
                        }}>
                        {allOptions.map((option) => (
                            <button
                                key={option.id || 'current'}
                                onClick={() => handleSeasonSelect(option.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors duration-200 ${option.id === selectedSeasonId ? 'bg-slate-700/30 border-r-2 border-blue-500' : ''
                                    }`}
                            >
                                {option.icon}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white text-sm">
                                            {option.label}
                                        </span>
                                        {option.isLive && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-green-400 text-xs font-medium">LIVE</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {option.subtitle}
                                    </div>
                                    {'endDate' in option && option.endDate && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Ended: {option.endDate.toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                {option.id === selectedSeasonId && (
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))}

                        {seasons.length === 0 && (
                            <div className="px-4 py-6 text-center">
                                <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No historical seasons available</p>
                                <p className="text-slate-500 text-xs mt-1">Season snapshots will appear here after using the season management system</p>
                                <div className="mt-3 text-xs text-blue-400">
                                    <span>💡 Use </span>
                                    <code className="bg-slate-700 px-1 py-0.5 rounded text-green-400">npm run season:help</code>
                                    <span> to create seasons</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Compact version for mobile/smaller spaces
export function CompactSeasonSelector({ onSeasonChange, selectedSeasonId, className = '' }: SeasonSelectorProps) {
    const [seasons, setSeasons] = useState<SeasonSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState(1);

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const [seasonsData, currentNumber] = await Promise.all([
                    getAllSeasons(),
                    getCurrentSeasonNumber()
                ]);

                setSeasons(seasonsData);
                setCurrentSeasonNumber(currentNumber);
            } catch (error) {
                console.error('Error fetching seasons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasons();
    }, []);

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-9 w-32 bg-slate-700 rounded"></div>
            </div>
        );
    }

    // Create options for native select
    const options = [
        { value: '', label: `Current Season ${currentSeasonNumber}` },
        ...seasons.map(season => ({
            value: season.id,
            label: season.seasonName
        }))
    ];

    return (
        <div className={`relative ${className}`}>
            <select
                value={selectedSeasonId || ''}
                onChange={(e) => onSeasonChange(e.target.value || null)}
                className="appearance-none bg-slate-800/80 border border-slate-600/50 text-white text-sm rounded px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
                {options.map((option) => (
                    <option key={option.value || 'current'} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
    );
} 