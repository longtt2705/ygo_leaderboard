'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, User, UserPlus, Swords, MapPin, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export function PublicHeader() {
    const { currentUser, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
            <div className="mx-auto max-w-7xl px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">Yu-Gi-Oh! Leaderboard</span>
                        </Link>

                        {currentUser && (
                            <nav className="flex items-center gap-4">
                                <Link
                                    href="/admin/add-player"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add Player
                                </Link>
                                <Link
                                    href="/admin/add-match"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Swords className="h-4 w-4" />
                                    Add Match
                                </Link>
                                <Link
                                    href="/admin/add-local"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Add Local
                                </Link>
                                <Link
                                    href="/admin/add-archetype"
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Gamepad2 className="h-4 w-4" />
                                    Add Archetype
                                </Link>
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <User className="h-4 w-4" />
                                    <span>{currentUser.displayName || currentUser.email}</span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/admin/login"
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Shield className="h-4 w-4" />
                                Admin Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 