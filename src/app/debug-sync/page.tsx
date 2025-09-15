'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllPlayers, getAllMatches } from '@/lib/firebaseService';
import { Player, Match } from '@/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DebugSyncPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState<{
        [playerId: string]: {
            currentStats: { wins: number; losses: number; totalMatches: number; winRate: number; streak: number; elo: number; rank: number };
            calculatedStats: { wins: number; losses: number; totalMatches: number; winRate: number; streak: number };
            discrepancies: string[];
        }
    }>({});

    const loadData = useCallback(async () => {
        try {
            const [playersData, matchesData] = await Promise.all([
                getAllPlayers(),
                getAllMatches()
            ]);

            setPlayers(playersData);
            setMatches(matchesData);

            // Analyze discrepancies
            const playerAnalysis: typeof analysis = {};

            playersData.forEach(player => {
                const playerMatches = matchesData.filter(match =>
                    match.player1Id === player.id || match.player2Id === player.id
                );

                const wins = playerMatches.filter(match => match.winnerId === player.id).length;
                const losses = playerMatches.length - wins;
                const totalMatches = playerMatches.length;
                const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

                // Calculate streak
                const sortedMatches = playerMatches
                    .sort((a, b) => {
                        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
                        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
                        return dateB.getTime() - dateA.getTime();
                    });

                let streak = 0;
                let lastResult: 'W' | 'L' | null = null;

                for (const match of sortedMatches) {
                    const isWin = match.winnerId === player.id;
                    const currentResult = isWin ? 'W' : 'L';

                    if (lastResult === null) {
                        lastResult = currentResult;
                        streak = isWin ? 1 : -1;
                    } else if (lastResult === currentResult) {
                        streak = isWin ? streak + 1 : streak - 1;
                    } else {
                        break;
                    }
                }

                const discrepancies: string[] = [];
                if (player.wins !== wins) discrepancies.push(`Wins: ${player.wins} vs ${wins}`);
                if (player.losses !== losses) discrepancies.push(`Losses: ${player.losses} vs ${losses}`);
                if (player.totalMatches !== totalMatches) discrepancies.push(`Total: ${player.totalMatches} vs ${totalMatches}`);
                if (player.winRate !== winRate) discrepancies.push(`Win Rate: ${player.winRate}% vs ${winRate}%`);
                if (player.streak !== streak) discrepancies.push(`Streak: ${player.streak} vs ${streak}`);

                playerAnalysis[player.id] = {
                    currentStats: {
                        wins: player.wins,
                        losses: player.losses,
                        totalMatches: player.totalMatches,
                        winRate: player.winRate,
                        streak: player.streak,
                        elo: player.elo,
                        rank: player.rank
                    },
                    calculatedStats: {
                        wins,
                        losses,
                        totalMatches,
                        winRate,
                        streak
                    },
                    discrepancies
                };
            });

            setAnalysis(playerAnalysis);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading debug data...</p>
                </div>
            </div>
        );
    }

    const playersWithDiscrepancies = players.filter(player =>
        analysis[player.id]?.discrepancies.length > 0
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative z-10">
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-6 py-6">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Admin
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Debug: Leaderboard Sync</h1>
                        <p className="text-slate-400 mt-2">
                            Comparing stored player stats with calculated stats from match history
                        </p>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-8">
                    <div className="space-y-8">
                        {/* Summary */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">{players.length}</div>
                                    <div className="text-slate-400">Total Players</div>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className="text-2xl font-bold text-green-400">{matches.length}</div>
                                    <div className="text-slate-400">Total Matches</div>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className="text-2xl font-bold text-red-400">{playersWithDiscrepancies.length}</div>
                                    <div className="text-slate-400">Players with Discrepancies</div>
                                </div>
                            </div>
                        </div>

                        {/* Players with Discrepancies */}
                        {playersWithDiscrepancies.length > 0 && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-6">Players with Discrepancies</h2>
                                <div className="space-y-4">
                                    {playersWithDiscrepancies.map(player => (
                                        <div key={player.id} className="p-4 bg-slate-700/30 rounded-lg border border-red-500/30">
                                            <h3 className="font-semibold text-white mb-2">{player.name}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Current (Stored)</h4>
                                                    <div className="text-sm text-slate-400 space-y-1">
                                                        <div>Wins: {analysis[player.id].currentStats.wins}</div>
                                                        <div>Losses: {analysis[player.id].currentStats.losses}</div>
                                                        <div>Total: {analysis[player.id].currentStats.totalMatches}</div>
                                                        <div>Win Rate: {analysis[player.id].currentStats.winRate}%</div>
                                                        <div>Streak: {analysis[player.id].currentStats.streak}</div>
                                                        <div>ELO: {analysis[player.id].currentStats.elo}</div>
                                                        <div>Rank: {analysis[player.id].currentStats.rank}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Calculated (From Matches)</h4>
                                                    <div className="text-sm text-slate-400 space-y-1">
                                                        <div>Wins: {analysis[player.id].calculatedStats.wins}</div>
                                                        <div>Losses: {analysis[player.id].calculatedStats.losses}</div>
                                                        <div>Total: {analysis[player.id].calculatedStats.totalMatches}</div>
                                                        <div>Win Rate: {analysis[player.id].calculatedStats.winRate}%</div>
                                                        <div>Streak: {analysis[player.id].calculatedStats.streak}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-600">
                                                <h4 className="text-sm font-medium text-red-400 mb-1">Discrepancies:</h4>
                                                <div className="text-sm text-red-300">
                                                    {analysis[player.id].discrepancies.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Players */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">All Players</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-600">
                                            <th className="text-left p-2 text-slate-300">Player</th>
                                            <th className="text-left p-2 text-slate-300">ELO</th>
                                            <th className="text-left p-2 text-slate-300">Rank</th>
                                            <th className="text-left p-2 text-slate-300">Record (Stored)</th>
                                            <th className="text-left p-2 text-slate-300">Record (Calculated)</th>
                                            <th className="text-left p-2 text-slate-300">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map(player => (
                                            <tr key={player.id} className="border-b border-slate-700/50">
                                                <td className="p-2 text-white">{player.name}</td>
                                                <td className="p-2 text-slate-300">{player.elo}</td>
                                                <td className="p-2 text-slate-300">{player.rank}</td>
                                                <td className="p-2 text-slate-300">
                                                    {player.wins}W {player.losses}L ({player.winRate}%)
                                                </td>
                                                <td className="p-2 text-slate-300">
                                                    {analysis[player.id]?.calculatedStats.wins}W {analysis[player.id]?.calculatedStats.losses}L ({analysis[player.id]?.calculatedStats.winRate}%)
                                                </td>
                                                <td className="p-2">
                                                    {analysis[player.id]?.discrepancies.length > 0 ? (
                                                        <span className="text-red-400">❌ Out of sync</span>
                                                    ) : (
                                                        <span className="text-green-400">✅ In sync</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 