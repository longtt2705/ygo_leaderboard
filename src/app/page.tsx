'use client';

import { useState, useEffect } from 'react';
import { TopPlayer } from "@/components/TopPlayer";
import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PublicHeader } from "../components/PublicHeader";
import { subscribeToPlayers, getAllMatches, getAllLocals } from "@/lib/firebaseService";
import { Users, Trophy, Swords, BarChart3, RefreshCw } from "lucide-react";
import { Player, Match, Local } from "@/types";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [locals, setLocals] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        // Set up real-time listener for players
        unsubscribe = subscribeToPlayers((updatedPlayers) => {
          setPlayers(updatedPlayers);
          setLoading(false);
        });

        // Fetch matches and locals (these don't need real-time updates for the main page)
        const [matchesData, localsData] = await Promise.all([
          getAllMatches(),
          getAllLocals()
        ]);

        setMatches(matchesData);
        setLocals(localsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [matchesData, localsData] = await Promise.all([
        getAllMatches(),
        getAllLocals()
      ]);
      setMatches(matchesData);
      setLocals(localsData);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Create local name mapping
  const localMap: { [key: string]: string } = {};
  locals.forEach(local => {
    localMap[local.id] = local.name;
  });

  // Calculate stats
  const totalPlayers = players.length;
  const totalMatches = matches.length;
  const averageElo = totalPlayers > 0 ? Math.round(players.reduce((sum, p) => sum + p.elo, 0) / totalPlayers) : 0;

  // Split players for different sections
  const topPlayer = players[0] || null;
  const featuredPlayers = players.slice(1, 5);
  const leaderboardPlayers = players.slice(5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading Leaderboard</h1>
          <p className="text-slate-400">Fetching the latest rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Leaderboard</h1>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (totalPlayers === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative z-10">
          <PublicHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">No Players Found</h1>
              <p className="text-slate-400 mb-6">The leaderboard is empty. Add some players to get started!</p>
            </div>
          </div>
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
        {/* Public Header */}
        <PublicHeader />

        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black text-white">
                    Yu-Gi-Oh! <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Leaderboard</span>
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">LIVE</span>
                  </div>
                </div>
                <p className="text-lg text-slate-400">
                  Competitive rankings for local duelists
                </p>
              </div>

              {/* Stats Summary */}
              <div className="hidden lg:flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Users className="h-6 w-6 text-blue-400" />
                    {totalPlayers}
                  </div>
                  <div className="text-sm text-slate-400">Total Players</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Swords className="h-6 w-6 text-green-400" />
                    {totalMatches}
                  </div>
                  <div className="text-sm text-slate-400">Total Matches</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                    {averageElo}
                  </div>
                  <div className="text-sm text-slate-400">Avg Rating</div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white px-3 py-2 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8 overflow-visible">
          <div className="space-y-12">
            {/* Top Player Section */}
            {topPlayer && (
              <section>
                <div className="mb-6 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-white">Champion</h2>
                </div>
                <TopPlayer player={topPlayer} localMap={localMap} />
              </section>
            )}

            {/* Featured Players Section */}
            {featuredPlayers.length > 0 && (
              <section className="overflow-visible">
                <div className="mb-6 flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <h2 className="text-3xl font-bold text-white">Top Contenders</h2>
                </div>
                <div className="pb-6">
                  <FeaturedPlayers players={featuredPlayers} localMap={localMap} />
                </div>
              </section>
            )}

            {/* Leaderboard Table Section */}
            {leaderboardPlayers.length > 0 && (
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                    <h2 className="text-3xl font-bold text-white">Full Rankings</h2>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>Showing ranks 6-{leaderboardPlayers.length + 5}</span>
                    <div className="h-4 w-px bg-slate-600" />
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span>Live Updates</span>
                    </div>
                  </div>
                </div>
                <LeaderboardTable players={leaderboardPlayers} localMap={localMap} />
              </section>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-16">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="text-slate-400">
                <p>&copy; 2024 Yu-Gi-Oh! Local Leaderboard. Built with Next.js & Tailwind CSS.</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">ELO System Active</span>
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
