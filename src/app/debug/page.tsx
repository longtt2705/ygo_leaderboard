import { getAllPlayers } from '@/lib/firebaseService';
import { Player } from '@/types';

export default async function DebugPage() {
    let players: Player[] = [];
    let error: string | null = null;

    try {
        players = await getAllPlayers();
    } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error';
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <h1 className="text-2xl font-bold mb-4">Database Debug</h1>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="bg-slate-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Players in Database ({players.length})</h2>

                {players.length === 0 ? (
                    <p className="text-slate-400">No players found. Database might be empty.</p>
                ) : (
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.id} className="bg-slate-700 p-3 rounded">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{player.name}</span>
                                    <span className="text-slate-400 text-sm font-mono">{player.id}</span>
                                </div>
                                <div className="text-sm text-slate-400">
                                    Rank #{player.rank} • {player.elo} YP • {player.wins}W {player.losses}L
                                </div>
                                <div className="text-xs text-blue-400 mt-1">
                                    <a href={`/player/${player.id}`} className="hover:underline">
                                        /player/{player.id}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6">
                <a href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Go to Admin (Seed Database)
                </a>
            </div>
        </div>
    );
} 