'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, User } from 'lucide-react';

export function AdminHeader() {
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
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Admin Panel</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <User className="h-4 w-4" />
                            <span>{currentUser?.displayName || currentUser?.email}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 