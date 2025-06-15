'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { seedDatabase } from '@/lib/seedData';
import { syncPlayerStats } from '@/lib/firebaseService';
import { Database, Users, Swords, MapPin, Plus, Loader2, RefreshCw } from 'lucide-react';
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
        </div>
    );
} 