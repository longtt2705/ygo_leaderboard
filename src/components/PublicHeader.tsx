'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Shield, User, Settings, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function PublicHeader() {
    const { currentUser, logout } = useAuth();
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const toggleDropdown = () => {
        if (!adminDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
        setAdminDropdownOpen(!adminDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Check if click is outside both the button and the dropdown
            if (buttonRef.current && !buttonRef.current.contains(target)) {
                const dropdown = document.querySelector('[data-dropdown="admin-dropdown"]');
                if (!dropdown || !dropdown.contains(target)) {
                    setAdminDropdownOpen(false);
                }
            }
        };

        if (adminDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [adminDropdownOpen]);

    const navigateAndClose = (path: string) => {
        console.log('navigating to', path);
        setAdminDropdownOpen(false);
        router.push(path);
    };

    return (
        <>
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
                                        href="/admin"
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Admin Dashboard
                                    </Link>
                                    <Link
                                        href="/admin/players"
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Users className="h-4 w-4" />
                                        Manage Players
                                    </Link>

                                    {/* Admin Dropdown */}
                                    <button
                                        ref={buttonRef}
                                        onClick={toggleDropdown}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Quick Actions
                                        <ChevronDown className={`h-4 w-4 transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
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

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>

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

            {/* Admin Dropdown Portal - Rendered outside header */}
            {adminDropdownOpen && (
                <div
                    data-dropdown="admin-dropdown"
                    className="fixed w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        zIndex: 50000 // Very high z-index
                    }}
                >
                    <div className="py-2">
                        <button
                            onClick={() => {
                                navigateAndClose('/admin/add-match');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Record Match
                        </button>
                        <button
                            onClick={() => {
                                navigateAndClose('/admin/add-local');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Add Local
                        </button>
                        <button
                            onClick={() => {
                                navigateAndClose('/admin/add-archetype');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Add Archetype
                        </button>
                        <div className="border-t border-slate-700 my-2"></div>
                        <button
                            onClick={() => {
                                navigateAndClose('/debug-sync');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Debug Sync
                        </button>
                        <button
                            onClick={() => {
                                navigateAndClose('/debug-env');
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            Debug Environment
                        </button>
                    </div>
                </div>
            )}
        </>
    );
} 