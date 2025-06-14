'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DebugEnvPage() {
    const envVars = {
        FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
        CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
        CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ? '✅ Set' : '❌ Missing',
    };

    const allSet = Object.values(envVars).every(status => status.includes('✅'));
    const firebaseVarsSet = Object.entries(envVars)
        .filter(([key]) => key.startsWith('FIREBASE'))
        .every(([, status]) => status.includes('✅'));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative z-10">
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-4xl px-6 py-6">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Admin
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Environment Variables Debug</h1>
                        <p className="text-slate-400 mt-2">
                            Check if all required environment variables are properly set
                        </p>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-6 py-8">
                    <div className="space-y-8">
                        {/* Status Overview */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-4">Status Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className={`text-2xl font-bold ${allSet ? 'text-green-400' : 'text-red-400'}`}>
                                        {allSet ? '✅' : '❌'}
                                    </div>
                                    <div className="text-slate-400">All Variables</div>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className={`text-2xl font-bold ${firebaseVarsSet ? 'text-green-400' : 'text-red-400'}`}>
                                        {firebaseVarsSet ? '✅' : '❌'}
                                    </div>
                                    <div className="text-slate-400">Firebase Config</div>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">
                                        {typeof window !== 'undefined' ? 'Client' : 'Server'}
                                    </div>
                                    <div className="text-slate-400">Render Context</div>
                                </div>
                            </div>
                        </div>

                        {/* Environment Variables */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">Environment Variables</h2>
                            <div className="space-y-3">
                                {Object.entries(envVars).map(([key, status]) => (
                                    <div key={key} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                                        <span className="text-slate-300 font-mono text-sm">
                                            NEXT_PUBLIC_{key}
                                        </span>
                                        <span className={`font-semibold ${status.includes('✅') ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6">How to Fix Missing Variables</h2>

                            {!firebaseVarsSet && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <h3 className="text-red-400 font-semibold mb-2">⚠️ Firebase Configuration Missing</h3>
                                    <p className="text-red-300 text-sm">
                                        Your Firebase environment variables are not set. The leaderboard sync will not work without these.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-white font-semibold mb-2">For Vercel Deployment:</h3>
                                    <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
                                        <li>Go to your Vercel Dashboard</li>
                                        <li>Select your project</li>
                                        <li>Go to Settings → Environment Variables</li>
                                        <li>Add each missing variable with its value</li>
                                        <li>Set for all environments (Production, Preview, Development)</li>
                                        <li>Redeploy your application</li>
                                    </ol>
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold mb-2">For Local Development:</h3>
                                    <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
                                        <li>Create a <code className="bg-slate-700 px-1 rounded">.env.local</code> file in your project root</li>
                                        <li>Add your Firebase configuration variables</li>
                                        <li>Restart your development server</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {/* Test Firebase Connection */}
                        {firebaseVarsSet && (
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-white mb-4">Firebase Connection Test</h2>
                                <p className="text-green-400 mb-4">
                                    ✅ Firebase environment variables are set. You can now test the connection:
                                </p>
                                <div className="space-y-2">
                                    <Link
                                        href="/admin"
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Go to Admin Dashboard
                                    </Link>
                                    <Link
                                        href="/debug-sync"
                                        className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                                    >
                                        Check Data Sync
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
} 