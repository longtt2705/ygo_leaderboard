'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { createPlayerProfile, getAllLocals, getAllDeckArchetypes } from '@/lib/firebaseService';
import { Local, DeckArchetype } from '@/types';
import { ArrowLeft, User, Gamepad2, MapPin, Save, X } from 'lucide-react';
import Link from 'next/link';
import { ImageUpload } from '@/components/ImageUpload';

export default function AddPlayerPage() {
    return (
        <ProtectedRoute>
            <AddPlayerForm />
        </ProtectedRoute>
    );
}

function AddPlayerForm() {
    const [formData, setFormData] = useState({
        name: '',
        deckArchetype: '',
        locals: [] as string[],
        avatar: '',
        elo: 1200
    });
    const [availableLocals, setAvailableLocals] = useState<Local[]>([]);
    const [availableArchetypes, setAvailableArchetypes] = useState<DeckArchetype[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Load locals and archetypes on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [locals, archetypes] = await Promise.all([
                    getAllLocals(),
                    getAllDeckArchetypes()
                ]);
                setAvailableLocals(locals);
                setAvailableArchetypes(archetypes);
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Failed to load locals and archetypes');
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.deckArchetype || formData.locals.length === 0) {
            setError('Please fill in all required fields and select at least one local');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const playerData = {
                name: formData.name,
                deckArchetype: formData.deckArchetype,
                locals: formData.locals,
                avatar: formData.avatar || ''
            };

            await createPlayerProfile('', playerData); // Empty userId for admin-created players
            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                deckArchetype: '',
                locals: [],
                avatar: '',
                elo: 1200
            });

            // Redirect after success
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create player';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'elo' ? parseInt(value) || 1200 : value
        }));
    };

    const handleLocalSelect = (localId: string) => {
        if (!formData.locals.includes(localId)) {
            setFormData(prev => ({
                ...prev,
                locals: [...prev.locals, localId]
            }));
        }
    };

    const removeLocal = (localId: string) => {
        setFormData(prev => ({
            ...prev,
            locals: prev.locals.filter(id => id !== localId)
        }));
    };

    const getLocalName = (localId: string) => {
        const local = availableLocals.find(l => l.id === localId);
        return local ? local.name : localId;
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
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
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Add New Player</h1>
                            <p className="text-slate-400">Register a new duelist to the leaderboard</p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 rounded-lg border border-green-500/50 bg-green-500/10">
                                <p className="text-green-400">Player created successfully! Redirecting...</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg border border-red-500/50 bg-red-500/10">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Player Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Player Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter player name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Deck Archetype */}
                            <div>
                                <label htmlFor="deckArchetype" className="block text-sm font-medium text-slate-300 mb-2">
                                    Deck Archetype *
                                </label>
                                <div className="relative">
                                    <Gamepad2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <select
                                        id="deckArchetype"
                                        name="deckArchetype"
                                        value={formData.deckArchetype}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        disabled={loading}
                                        required
                                    >
                                        <option value="">Select deck archetype</option>
                                        {availableArchetypes.map(archetype => (
                                            <option key={archetype.id} value={archetype.name}>{archetype.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {availableArchetypes.length === 0 && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        No archetypes available. <Link href="/admin/add-archetype" className="text-blue-400 hover:text-blue-300">Add one first</Link>
                                    </p>
                                )}
                            </div>

                            {/* Locals */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Locals * (Select at least one)
                                </label>

                                {/* Selected Locals */}
                                {formData.locals.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {formData.locals.map(localId => (
                                            <span
                                                key={localId}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                                            >
                                                {getLocalName(localId)}
                                                <button
                                                    type="button"
                                                    onClick={() => removeLocal(localId)}
                                                    className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
                                                    disabled={loading}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Local Selection */}
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleLocalSelect(e.target.value);
                                                e.target.value = ''; // Reset selection
                                            }
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        disabled={loading}
                                    >
                                        <option value="">Add a local...</option>
                                        {availableLocals
                                            .filter(local => !formData.locals.includes(local.id))
                                            .map(local => (
                                                <option key={local.id} value={local.id}>
                                                    {local.name} - {local.location}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                {availableLocals.length === 0 && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        No locals available. <Link href="/admin/add-local" className="text-blue-400 hover:text-blue-300">Add one first</Link>
                                    </p>
                                )}
                            </div>

                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Avatar (Optional)
                                </label>
                                <ImageUpload
                                    currentImageUrl={formData.avatar}
                                    onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, avatar: imageUrl }))}
                                    size="md"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || availableLocals.length === 0 || availableArchetypes.length === 0}
                            >
                                <Save className="h-5 w-5" />
                                {loading ? 'Creating Player...' : 'Create Player'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
} 