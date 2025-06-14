'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getAllPlayers, createPlayer, updatePlayer, deletePlayer, getAllLocals } from '@/lib/firebaseService';
import { Player, Local } from '@/types';
import { getTierFromElo, generateAvatarUrl } from '@/lib/utils';
import { ArrowLeft, Plus, Edit, Trash2, Search, Users, Save, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PlayersManagementPage() {
    return (
        <ProtectedRoute>
            <PlayersManagement />
        </ProtectedRoute>
    );
}

interface PlayerFormData {
    name: string;
    elo: number;
    wins: number;
    losses: number;
    mainDeck: string;
    locals: string[];
    avatar: string;
}

function PlayersManagement() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [locals, setLocals] = useState<Local[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [formData, setFormData] = useState<PlayerFormData>({
        name: '',
        elo: 1200,
        wins: 0,
        losses: 0,
        mainDeck: '',
        locals: [],
        avatar: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [playersData, localsData] = await Promise.all([
                getAllPlayers(),
                getAllLocals()
            ]);
            setPlayers(playersData);
            setLocals(localsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.mainDeck?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '',
            elo: 1200,
            wins: 0,
            losses: 0,
            mainDeck: '',
            locals: [],
            avatar: ''
        });
        setEditingPlayer(null);
        setShowForm(false);
        setError('');
        setSuccess('');
    };

    const handleEdit = (player: Player) => {
        setEditingPlayer(player);
        setFormData({
            name: player.name,
            elo: player.elo,
            wins: player.wins,
            losses: player.losses,
            mainDeck: player.mainDeck || '',
            locals: player.locals || [],
            avatar: player.avatar
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.mainDeck.trim()) {
            setError('Name and main deck are required');
            return;
        }

        try {
            setFormLoading(true);
            setError('');

            const totalMatches = formData.wins + formData.losses;
            const winRate = totalMatches > 0 ? Math.round((formData.wins / totalMatches) * 100) : 0;
            const tier = getTierFromElo(formData.elo);
            const avatar = formData.avatar || generateAvatarUrl(formData.name);

            const playerData = {
                name: formData.name,
                avatar,
                elo: formData.elo,
                wins: formData.wins,
                losses: formData.losses,
                winRate,
                tier,
                locals: formData.locals,
                decks: [{
                    archetypeId: `archetype-${Date.now()}`,
                    archetypeName: formData.mainDeck,
                    isMain: true
                }],
                mainDeck: formData.mainDeck,
                totalMatches,
                streak: 0,
                peakElo: formData.elo,
                recentMatches: [],
                rank: 0 // Will be calculated when fetched
            };

            if (editingPlayer) {
                await updatePlayer(editingPlayer.id, playerData);
                setSuccess('Player updated successfully!');
            } else {
                await createPlayer(playerData);
                setSuccess('Player created successfully!');
            }

            await loadData();
            resetForm();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to save player');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (player: Player) => {
        if (!confirm(`Are you sure you want to delete ${player.name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await deletePlayer(player.id);
            setSuccess('Player deleted successfully!');
            await loadData();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete player');
        }
    };

    const handleLocalToggle = (localId: string) => {
        setFormData(prev => ({
            ...prev,
            locals: prev.locals.includes(localId)
                ? prev.locals.filter(id => id !== localId)
                : [...prev.locals, localId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading players...</p>
                </div>
            </div>
        );
    }

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
                            <div className="flex items-center gap-4">
                                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Admin
                                </Link>
                                <div className="h-6 w-px bg-slate-600"></div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Users className="h-6 w-6" />
                                    Player Management
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add Player
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-6 py-8">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 p-4 rounded-lg border border-green-500/50 bg-green-500/10">
                            <p className="text-green-400">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded-lg border border-red-500/50 bg-red-500/10">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search players by name or deck..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    {/* Players Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50">
                            <h2 className="text-xl font-bold text-white">
                                Players ({filteredPlayers.length})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/30">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Player</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">ELO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Record</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Deck</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Locals</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {filteredPlayers.map((player) => (
                                        <tr key={player.id} className="hover:bg-slate-700/20">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Image
                                                        className="h-10 w-10 rounded-full"
                                                        src={player.avatar || 'https://via.placeholder.com/150'}
                                                        alt={player.name}
                                                        width={40}
                                                        height={40}
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{player.name}</div>
                                                        <div className="text-sm text-slate-400">{player.tier}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{player.rank}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{player.elo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                {player.wins}W {player.losses}L ({player.winRate}%)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{player.mainDeck}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                {player.locals?.length || 0} locals
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(player)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(player)}
                                                        className="text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Player Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingPlayer ? 'Edit Player' : 'Add New Player'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        ELO
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.elo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, elo: parseInt(e.target.value) || 1200 }))}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        min="1000"
                                        max="3000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Wins
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.wins}
                                        onChange={(e) => setFormData(prev => ({ ...prev, wins: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Losses
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.losses}
                                        onChange={(e) => setFormData(prev => ({ ...prev, losses: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Main Deck *
                                </label>
                                <input
                                    type="text"
                                    value={formData.mainDeck}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mainDeck: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Blue-Eyes White Dragon"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Avatar URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Locals
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {locals.map((local) => (
                                        <label key={local.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.locals.includes(local.id)}
                                                onChange={() => handleLocalToggle(local.id)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm text-slate-300">{local.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    {formLoading ? 'Saving...' : editingPlayer ? 'Update Player' : 'Create Player'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 