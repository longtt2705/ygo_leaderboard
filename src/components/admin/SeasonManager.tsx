'use client';

import React, { useState } from 'react';
import {
    startNewSeason,
    createSeasonSnapshot,
    resetSeasonData,
    getAllSnapshots,
    getCurrentSeasonNumber
} from '@/lib/firebaseService';
import { SeasonConfig, PlayerTier } from '@/types';

interface SeasonManagerProps {
    onSeasonChange?: () => void;
}

export default function SeasonManager({ onSeasonChange }: SeasonManagerProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

    const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleStartNewSeason = async () => {
        if (!confirm('⚠️ This will create a snapshot of the current season and reset all player data. This action cannot be undone. Continue?')) {
            return;
        }

        setLoading(true);
        try {
            const currentSeasonNumber = await getCurrentSeasonNumber();
            const seasonName = prompt('Enter season name (optional):', `Season ${currentSeasonNumber}`) || `Season ${currentSeasonNumber}`;

            const seasonConfig: SeasonConfig = {
                seasonNumber: currentSeasonNumber,
                seasonName,
                startDate: new Date(),
                resetElo: 1200,
                resetTier: PlayerTier.SILVER,
                preservePeakElo: true
            };

            const result = await startNewSeason(seasonConfig, true);

            showMessage(
                `🎉 New season "${seasonName}" started successfully! ${result.snapshotId ? `Snapshot ID: ${result.snapshotId}` : ''}`,
                'success'
            );

            onSeasonChange?.();
        } catch (error) {
            console.error('Error starting new season:', error);
            showMessage(`❌ Error starting new season: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSnapshot = async () => {
        if (!confirm('Create a snapshot of the current season?')) {
            return;
        }

        setLoading(true);
        try {
            const currentSeasonNumber = await getCurrentSeasonNumber();
            const seasonName = prompt('Enter season name for snapshot:', `Season ${currentSeasonNumber - 1}`) || `Season ${currentSeasonNumber - 1}`;

            const seasonConfig: SeasonConfig = {
                seasonNumber: currentSeasonNumber - 1,
                seasonName,
                startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Estimate 90 days ago
                endDate: new Date()
            };

            const snapshotId = await createSeasonSnapshot(seasonConfig);
            showMessage(`📸 Snapshot created successfully! ID: ${snapshotId}`, 'success');
        } catch (error) {
            console.error('Error creating snapshot:', error);
            showMessage(`❌ Error creating snapshot: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetData = async () => {
        const resetEloStr = prompt('Enter reset ELO value (default: 1200):', '1200');
        const resetElo = parseInt(resetEloStr || '1200') || 1200;

        if (!confirm(`⚠️ This will reset ALL player statistics to default values (ELO: ${resetElo}). This action cannot be undone. Continue?`)) {
            return;
        }

        setLoading(true);
        try {
            const currentSeasonNumber = await getCurrentSeasonNumber();

            const seasonConfig: SeasonConfig = {
                seasonNumber: currentSeasonNumber,
                seasonName: 'Data Reset',
                startDate: new Date(),
                resetElo,
                resetTier: PlayerTier.SILVER,
                preservePeakElo: true
            };

            await resetSeasonData(seasonConfig);
            showMessage('🔄 Player data reset completed!', 'success');
            onSeasonChange?.();
        } catch (error) {
            console.error('Error resetting data:', error);
            showMessage(`❌ Error resetting data: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleListSeasons = async () => {
        setLoading(true);
        try {
            const seasons = await getAllSnapshots();
            if (seasons.length === 0) {
                showMessage('No seasons found.', 'info');
            } else {
                const seasonList = seasons.slice(0, 5).map((season, index) => {
                    const topPlayer = season.players && season.players.length > 0
                        ? season.players.reduce((top, p) => p.elo > top.elo ? p : top, season.players[0])
                        : null;
                    return `${index === 0 ? '👑' : '  '} ${season.name} - Champion: ${topPlayer?.name || 'N/A'} (${topPlayer?.elo || 0} ELO)`;
                }).join('\n');

                alert(`Recent Seasons:\n\n${seasonList}\n\n${seasons.length > 5 ? `... and ${seasons.length - 5} more seasons` : ''}`);
            }
        } catch (error) {
            console.error('Error listing seasons:', error);
            showMessage(`❌ Error listing seasons: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🏟️ Season Management
            </h2>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        messageType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <button
                    onClick={handleStartNewSeason}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Processing...' : '🏆 Start New Season'}
                </button>

                <button
                    onClick={handleCreateSnapshot}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Processing...' : '📸 Create Snapshot'}
                </button>

                <button
                    onClick={handleResetData}
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Processing...' : '🔄 Reset Data Only'}
                </button>

                <button
                    onClick={handleListSeasons}
                    disabled={loading}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '⏳ Processing...' : '📋 View Season History'}
                </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⚠️ Important Notes
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• <strong>Start New Season</strong>: Creates a snapshot AND resets all player data</li>
                    <li>• <strong>Create Snapshot</strong>: Saves current season data without resetting anything</li>
                    <li>• <strong>Reset Data Only</strong>: Resets all player stats without creating a snapshot</li>
                    <li>• <strong>Peak ELO</strong>: Player peak ELO values are preserved across seasons by default</li>
                    <li>• <strong>Backup</strong>: Always create snapshots before resetting data</li>
                </ul>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                💡 <strong>Pro Tip</strong>: For advanced options and bulk operations, use the command-line season manager: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run season:help</code>
            </div>
        </div>
    );
} 