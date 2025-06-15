'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPlayer, updatePlayer, getAllLocals, getAllDeckArchetypes } from '@/lib/firebaseService';
import { Player, Local, DeckArchetype } from '@/types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/ImageUpload';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
    const { currentUser } = useAuth();
    const [player, setPlayer] = useState<Player | null>(null);
    const [locals, setLocals] = useState<Local[]>([]);
    const [archetypes, setArchetypes] = useState<DeckArchetype[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        mainDeck: '',
        locals: [] as string[]
    });

    useEffect(() => {
        if (!currentUser) return;

        const loadData = async () => {
            try {
                const [playersData, localsData, archetypesData] = await Promise.all([
                    // Find player by userId
                    getPlayer(currentUser.uid).catch(() => null),
                    getAllLocals(),
                    getAllDeckArchetypes()
                ]);

                if (playersData) {
                    setPlayer(playersData);
                    setFormData({
                        name: playersData.name,
                        avatar: playersData.avatar || '',
                        mainDeck: playersData.mainDeck || '',
                        locals: playersData.locals || []
                    });
                }

                setLocals(localsData);
                setArchetypes(archetypesData);
            } catch (error) {
                console.error('Error loading profile:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!player) return;

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            await updatePlayer(player.id, {
                name: formData.name,
                avatar: formData.avatar,
                mainDeck: formData.mainDeck,
                locals: formData.locals,
                decks: [{
                    archetypeId: '',
                    archetypeName: formData.mainDeck,
                    isMain: true
                }]
            });

            setSuccess('Profile updated successfully!');

            // Update local player state
            setPlayer(prev => prev ? {
                ...prev,
                name: formData.name,
                avatar: formData.avatar,
                mainDeck: formData.mainDeck,
                locals: formData.locals
            } : null);

        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
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

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
                    <p className="text-slate-400 mb-6">Please log in to view your profile.</p>
                    <Link href="/admin/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Loading Profile</h1>
                    <p className="text-slate-400">Please wait...</p>
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
                    <p className="text-slate-400 mb-6">No player profile found for your account.</p>
                    <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                        Back to Leaderboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-4xl px-6 py-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Leaderboard
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-4xl px-6 py-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <Avatar className="h-16 w-16 border-2 border-slate-600/50">
                                <AvatarImage src={player.avatar} alt={player.name} />
                                <AvatarFallback className="bg-slate-700 text-white text-xl font-bold">
                                    {player.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                                <p className="text-slate-400">Update your player information</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Profile Picture
                                </label>
                                <ImageUpload
                                    currentImageUrl={formData.avatar}
                                    onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, avatar: imageUrl }))}
                                    size="lg"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Display Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            {/* Main Deck */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Main Deck Archetype
                                </label>
                                <select
                                    value={formData.mainDeck}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mainDeck: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="">Select an archetype</option>
                                    {archetypes.map((archetype) => (
                                        <option key={archetype.id} value={archetype.name}>
                                            {archetype.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Locals */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Local Tournaments
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {locals.map((local) => (
                                        <label key={local.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.locals.includes(local.id)}
                                                onChange={() => handleLocalToggle(local.id)}
                                                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-slate-300">{local.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-600/50 disabled:to-purple-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
} 