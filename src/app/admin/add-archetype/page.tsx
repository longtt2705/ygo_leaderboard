'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { createDeckArchetype } from '@/lib/firebaseService';
import { ArrowLeft, Gamepad2, FileText, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddArchetypePage() {
    return (
        <ProtectedRoute>
            <AddArchetypeForm />
        </ProtectedRoute>
    );
}

function AddArchetypeForm() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        bossMonsterImageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Please fill in the archetype name');
            return;
        }

        try {
            setError('');
            setLoading(true);

            const archetypeData = {
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl,
                bossMonsterImageUrl: formData.bossMonsterImageUrl
            };

            await createDeckArchetype(archetypeData);
            setSuccess(true);

            // Reset form
            setFormData({
                name: '',
                description: '',
                imageUrl: '',
                bossMonsterImageUrl: ''
            });

            // Redirect after success
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create deck archetype';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                            <h1 className="text-3xl font-bold text-white mb-2">Add New Deck Archetype</h1>
                            <p className="text-slate-400">Register a new deck archetype with image</p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="mb-6 p-4 rounded-lg border border-green-500/50 bg-green-500/10">
                                <p className="text-green-400">Deck archetype created successfully! Redirecting...</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 rounded-lg border border-red-500/50 bg-red-500/10">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Archetype Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Archetype Name *
                                </label>
                                <div className="relative">
                                    <Gamepad2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter deck archetype name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                                    Description (Optional)
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        placeholder="Enter description about the deck archetype..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Archetype Image URL */}
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300 mb-2">
                                    Archetype Image URL (Optional)
                                </label>
                                <input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="url"
                                    placeholder="https://example.com/archetype-image.jpg"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    disabled={loading}
                                />
                            </div>

                            {/* Boss Monster Image URL */}
                            <div>
                                <label htmlFor="bossMonsterImageUrl" className="block text-sm font-medium text-slate-300 mb-2">
                                    Boss Monster Image URL (Optional)
                                </label>
                                <input
                                    id="bossMonsterImageUrl"
                                    name="bossMonsterImageUrl"
                                    type="url"
                                    placeholder="https://example.com/boss-monster.jpg"
                                    value={formData.bossMonsterImageUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    disabled={loading}
                                />
                                <p className="mt-1 text-xs text-slate-500">Used as background blur effect in player profiles</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                <Save className="h-5 w-5" />
                                {loading ? 'Creating Archetype...' : 'Create Archetype'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
} 