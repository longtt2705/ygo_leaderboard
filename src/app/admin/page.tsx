'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { seedDatabase } from '@/lib/seedData';
import { syncPlayerStats, createSnapshot, resetAllPlayersToDefault, startNewSeason } from '@/lib/firebaseService';
import { Database, Users, Swords, MapPin, Plus, Loader2, RefreshCw, Camera, X, Save, RotateCcw, Play } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <ProtectedRoute>
            <AdminDashboard />
        </ProtectedRoute>
    );
}

function AdminDashboard() {
    const [seeding, setSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string>('');
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<string>('');
    const [creatingSnapshot, setCreatingSnapshot] = useState(false);
    const [snapshotResult, setSnapshotResult] = useState<string>('');
    const [showSnapshotForm, setShowSnapshotForm] = useState(false);
    const [snapshotFormData, setSnapshotFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });
    const [resetting, setResetting] = useState(false);
    const [resetResult, setResetResult] = useState<string>('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [startingSeason, setStartingSeason] = useState(false);
    const [seasonResult, setSeasonResult] = useState<string>('');
    const [showSeasonConfirm, setShowSeasonConfirm] = useState(false);

    const handleSeedDatabase = async () => {
        try {
            setSeeding(true);
            setSeedResult('');
            await seedDatabase();
            setSeedResult('Database seeded successfully! Created 20 players, 4 locals, and 100 matches.');
        } catch (error) {
            setSeedResult(`Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSeeding(false);
        }
    };

    const handleSyncStats = async () => {
        try {
            setSyncing(true);
            setSyncResult('');
            await syncPlayerStats();
            setSyncResult('Player stats synced successfully! All rankings and statistics updated.');
        } catch (error) {
            setSyncResult(`Error syncing stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSyncing(false);
        }
    };

    const handleCreateSnapshot = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!snapshotFormData.name.trim() || !snapshotFormData.startDate || !snapshotFormData.endDate) {
            setSnapshotResult('Please fill in all fields');
            return;
        }

        const startDate = new Date(snapshotFormData.startDate);
        const endDate = new Date(snapshotFormData.endDate);

        if (startDate >= endDate) {
            setSnapshotResult('End date must be after start date');
            return;
        }

        try {
            setCreatingSnapshot(true);
            setSnapshotResult('');

            const snapshotId = await createSnapshot({
                name: snapshotFormData.name,
                startDate,
                endDate
            });

            setSnapshotResult(`Snapshot "${snapshotFormData.name}" created successfully! ID: ${snapshotId}`);
            setSnapshotFormData({ name: '', startDate: '', endDate: '' });
            setShowSnapshotForm(false);
        } catch (error) {
            setSnapshotResult(`Error creating snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setCreatingSnapshot(false);
        }
    };

    const resetSnapshotForm = () => {
        setSnapshotFormData({ name: '', startDate: '', endDate: '' });
        setShowSnapshotForm(false);
        setSnapshotResult('');
    };

    const handleResetPlayers = async () => {
        try {
            setResetting(true);
            setResetResult('');

            await resetAllPlayersToDefault();
            setResetResult('All players have been reset to default values successfully! ELO: 1200, Wins: 0, Losses: 0, Streak: 0');
            setShowResetConfirm(false);
        } catch (error) {
            setResetResult(`Error resetting players: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setResetting(false);
        }
    };

    const handleStartNewSeason = async () => {
        try {
            setStartingSeason(true);
            setSeasonResult('');

            await startNewSeason();
            setSeasonResult('New season started successfully! Current stats saved as last season data and reset to defaults.');
            setShowSeasonConfirm(false);
        } catch (error) {
            setSeasonResult(`Error starting new season: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setStartingSeason(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-6 py-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                                Back to Leaderboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-6 py-8">
                    <div className="space-y-8">
                        {/* Database Management */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Database Management
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <h3 className="font-semibold text-white mb-2">Seed Database</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Initialize the database with sample players, locals, and matches.
                                        This will create 20 players, 4 local venues, and 100 sample matches.
                                    </p>
                                    <button
                                        onClick={handleSeedDatabase}
                                        disabled={seeding}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {seeding ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Seeding Database...
                                            </>
                                        ) : (
                                            <>
                                                <Database className="h-4 w-4" />
                                                Seed Database
                                            </>
                                        )}
                                    </button>

                                    {seedResult && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm ${seedResult.includes('Error')
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            }`}>
                                            {seedResult}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <h3 className="font-semibold text-white mb-2">Sync Player Stats</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Recalculate all player statistics and rankings based on actual match history.
                                        Use this if the leaderboard seems out of sync.
                                    </p>
                                    <button
                                        onClick={handleSyncStats}
                                        disabled={syncing}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {syncing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Syncing Stats...
                                            </>
                                        ) : (
                                            <>
                                                <Database className="h-4 w-4" />
                                                Sync Stats
                                            </>
                                        )}
                                    </button>

                                    {syncResult && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm ${syncResult.includes('Error')
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            }`}>
                                            {syncResult}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <h3 className="font-semibold text-white mb-2">Create Player Snapshot</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Create a snapshot of the current player collection with metadata including date range and statistics.
                                        This preserves the current state of all players for historical tracking.
                                    </p>
                                    <button
                                        onClick={() => setShowSnapshotForm(true)}
                                        disabled={creatingSnapshot}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {creatingSnapshot ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creating Snapshot...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-4 w-4" />
                                                Create Snapshot
                                            </>
                                        )}
                                    </button>

                                    {snapshotResult && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm ${snapshotResult.includes('Error')
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            }`}>
                                            {snapshotResult}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <h3 className="font-semibold text-white mb-2">Reset All Players</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Reset all players to default values: ELO 1200, 0 wins/losses, 0 streak, Silver tier.
                                        <span className="block mt-1 text-red-400 font-medium">⚠️ This action cannot be undone!</span>
                                    </p>
                                    <button
                                        onClick={() => setShowResetConfirm(true)}
                                        disabled={resetting}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {resetting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Resetting Players...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="h-4 w-4" />
                                                Reset All Players
                                            </>
                                        )}
                                    </button>

                                    {resetResult && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm ${resetResult.includes('Error')
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            }`}>
                                            {resetResult}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                                    <h3 className="font-semibold text-white mb-2">Start New Season</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Start a new season by saving current stats as "last season" data and resetting current stats to defaults.
                                        This preserves historical achievements while starting fresh.
                                        <span className="block mt-1 text-blue-400 font-medium">💡 Recommended for season transitions</span>
                                    </p>
                                    <button
                                        onClick={() => setShowSeasonConfirm(true)}
                                        disabled={startingSeason}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        {startingSeason ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Starting New Season...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                Start New Season
                                            </>
                                        )}
                                    </button>

                                    {seasonResult && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm ${seasonResult.includes('Error')
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            }`}>
                                            {seasonResult}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Quick Actions
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Link
                                    href="/admin/players"
                                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors group"
                                >
                                    <Users className="h-8 w-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-white mb-1">Manage Players</h3>
                                    <p className="text-slate-400 text-sm">View, create, edit, and delete players</p>
                                </Link>

                                <Link
                                    href="/admin/add-match"
                                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors group"
                                >
                                    <Swords className="h-8 w-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-white mb-1">Record Match</h3>
                                    <p className="text-slate-400 text-sm">Add a new match result</p>
                                </Link>

                                <Link
                                    href="/admin/add-local"
                                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors group"
                                >
                                    <MapPin className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-white mb-1">Add Local</h3>
                                    <p className="text-slate-400 text-sm">Create a new tournament venue</p>
                                </Link>

                                <Link
                                    href="/admin/add-archetype"
                                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors group"
                                >
                                    <Database className="h-8 w-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-white mb-1">Add Archetype</h3>
                                    <p className="text-slate-400 text-sm">Create a new deck archetype</p>
                                </Link>

                                <Link
                                    href="/admin/cleanup-avatars"
                                    className="p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors group"
                                >
                                    <RefreshCw className="h-8 w-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-semibold text-white mb-1">Cleanup Avatars</h3>
                                    <p className="text-slate-400 text-sm">Fix placeholder URL timeout errors</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Snapshot Form Modal */}
            {showSnapshotForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Create Player Snapshot</h2>
                            <button
                                onClick={resetSnapshotForm}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSnapshot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Snapshot Name *
                                </label>
                                <input
                                    type="text"
                                    value={snapshotFormData.name}
                                    onChange={(e) => setSnapshotFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    placeholder="e.g., Season 1 Finals, Monthly Rankings..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={snapshotFormData.startDate}
                                    onChange={(e) => setSnapshotFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    value={snapshotFormData.endDate}
                                    onChange={(e) => setSnapshotFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="text-xs text-slate-400 bg-slate-700/30 p-3 rounded-lg">
                                <p className="mb-1"><strong>Note:</strong> This will capture the current state of all players including:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Current ELO ratings and tiers</li>
                                    <li>Win/loss records and statistics</li>
                                    <li>Recent match history</li>
                                    <li>Leaderboard metadata</li>
                                </ul>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetSnapshotForm}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingSnapshot}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    {creatingSnapshot ? 'Creating...' : 'Create Snapshot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-red-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-red-400">⚠️ Confirm Reset</h2>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h3 className="text-red-400 font-semibold mb-2">This will reset ALL players to:</h3>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• ELO: 1200 (Silver tier)</li>
                                    <li>• Wins: 0</li>
                                    <li>• Losses: 0</li>
                                    <li>• Win Rate: 0%</li>
                                    <li>• Win Streak: 0</li>
                                    <li>• Peak ELO: 1200</li>
                                    <li>• Recent matches: cleared</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-yellow-400 text-sm">
                                    <strong>Warning:</strong> This action cannot be undone. Consider creating a snapshot before proceeding if you want to preserve the current state.
                                </p>
                            </div>

                            <div className="text-sm text-slate-400">
                                <p>Players will keep their:</p>
                                <ul className="mt-1 space-y-1">
                                    <li>• Name and avatar</li>
                                    <li>• Deck information</li>
                                    <li>• Local affiliations</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPlayers}
                                disabled={resetting}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {resetting ? 'Resetting...' : 'Yes, Reset All Players'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Season Confirmation Modal */}
            {showSeasonConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-blue-500/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-blue-400">🚀 Start New Season</h2>
                            <button
                                onClick={() => setShowSeasonConfirm(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h3 className="text-blue-400 font-semibold mb-2">This will save current stats as "Last Season":</h3>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• Current ELO → Last Season ELO</li>
                                    <li>• Current Peak ELO → Last Season Peak ELO</li>
                                    <li>• Current Rank → Last Season Rank</li>
                                </ul>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h3 className="text-green-400 font-semibold mb-2">Then reset current season to:</h3>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    <li>• ELO: 1200 (Silver tier)</li>
                                    <li>• Wins: 0, Losses: 0</li>
                                    <li>• Win Streak: 0</li>
                                    <li>• Recent matches: cleared</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-yellow-400 text-sm">
                                    <strong>Tip:</strong> This is the recommended way to transition between seasons as it preserves historical achievements while providing a fresh start.
                                </p>
                            </div>

                            <div className="text-sm text-slate-400">
                                <p>Players will keep their:</p>
                                <ul className="mt-1 space-y-1">
                                    <li>• Name, avatar, and deck information</li>
                                    <li>• Local affiliations</li>
                                    <li>• Previous last season data (if any)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowSeasonConfirm(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartNewSeason}
                                disabled={startingSeason}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Play className="h-4 w-4" />
                                {startingSeason ? 'Starting...' : 'Yes, Start New Season'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 