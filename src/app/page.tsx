'use client';

import { useState, useEffect } from 'react';
import { TopPlayer } from "@/components/TopPlayer";
import { FeaturedPlayers } from "@/components/FeaturedPlayers";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PublicHeader } from "../components/PublicHeader";
import { subscribeToPlayers, getAllMatches, getAllLocals, getAllSnapshots, getSnapshot } from "@/lib/firebaseService";
import { Users, Trophy, Swords, BarChart3, RefreshCw, ChevronDown } from "lucide-react";
import { Player, Match, Local, Snapshot } from "@/types";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [locals, setLocals] = useState<Local[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('live');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        // Set up real-time listener for players (only update if viewing live data)
        unsubscribe = subscribeToPlayers((updatedPlayers) => {
          setPlayers(prevPlayers => {
            // Only update if we're viewing live data
            if (selectedSnapshot === 'live') {
              return updatedPlayers.sort((a, b) => a.elo === b.elo ? (a.lastSeasonRank || 0) - (b.lastSeasonRank || 0) : a.elo - b.elo).map((player, index) => ({
                ...player,
                rank: index + 1
              }));
            }
            // If we're viewing a snapshot, keep the current players unless it's the initial load
            return prevPlayers.length === 0 ? updatedPlayers : prevPlayers;
          });
          setLoading(false);
        });

        // Fetch matches, locals, and snapshots (these don't need real-time updates for the main page)
        const [matchesData, localsData, snapshotsData] = await Promise.all([
          getAllMatches(),
          getAllLocals(),
          getAllSnapshots()
        ]);

        setMatches(matchesData);
        setLocals(localsData);
        setSnapshots(snapshotsData);
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
  }, [selectedSnapshot]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [matchesData, localsData, snapshotsData] = await Promise.all([
        getAllMatches(),
        getAllLocals(),
        getAllSnapshots()
      ]);
      setMatches(matchesData);
      setLocals(localsData);
      setSnapshots(snapshotsData);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSnapshotChange = async (snapshotId: string) => {
    if (snapshotId === selectedSnapshot) return;

    setSelectedSnapshot(snapshotId);
    setShowDropdown(false);

    if (snapshotId === 'live') {
      // Switch back to live data - players will be updated by the subscription
      return;
    }

    // Load snapshot data
    setLoadingSnapshot(true);
    try {
      const snapshot = await getSnapshot(snapshotId);
      if (snapshot) {
        setPlayers(snapshot.players);
      }
    } catch (err) {
      console.error('Error loading snapshot:', err);
      setError('Failed to load snapshot data');
    } finally {
      setLoadingSnapshot(false);
    }
  };

  // Create local name mapping
  const localMap: { [key: string]: string } = {};
  locals.forEach(local => {
    localMap[local.id] = local.name;
  });

  // Calculate stats (use snapshot metadata if viewing a snapshot)
  const currentSnapshot = selectedSnapshot !== 'live' ? snapshots.find(s => s.id === selectedSnapshot) : null;
  const totalPlayers = currentSnapshot ? currentSnapshot.totalPlayers : players.length;
  const totalMatches = currentSnapshot ? currentSnapshot.metadata?.totalMatches || 0 : matches.length;
  const averageElo = currentSnapshot ? currentSnapshot.metadata?.averageElo || 0 : (totalPlayers > 0 ? Math.round(players.reduce((sum, p) => sum + p.elo, 0) / totalPlayers) : 0);

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
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                    Yu-Gi-Oh! <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Leaderboard</span>
                  </h1>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${selectedSnapshot === 'live'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-orange-500/10 border border-orange-500/30'
                    }`}>
                    <div className={`h-2 w-2 rounded-full ${selectedSnapshot === 'live'
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-orange-400'
                      }`} />
                    <span className={`text-sm font-medium ${selectedSnapshot === 'live'
                      ? 'text-green-400'
                      : 'text-orange-400'
                      }`}>
                      {selectedSnapshot === 'live' ? 'LIVE' : 'HISTORICAL'}
                    </span>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-slate-400">
                  Competitive rankings for local duelists
                </p>
              </div>

              {/* Season Selector */}
              <div className="lg:order-1 mb-4 lg:mb-0 relative z-50">
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loadingSnapshot}
                    className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 disabled:bg-slate-800/50 border border-slate-600/50 hover:border-slate-500/50 text-white px-4 py-2.5 rounded-lg transition-all duration-200 min-w-[200px] justify-between relative z-10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {selectedSnapshot === 'live'
                          ? 'Current Season (Live)'
                          : snapshots.find(s => s.id === selectedSnapshot)?.name || 'Unknown Season'
                        }
                      </span>
                      {selectedSnapshot === 'live' && (
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                      />

                      {/* Dropdown Content */}
                      <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {/* Current Season (Live) */}
                        <button
                          onClick={() => handleSnapshotChange('live')}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-600/30 ${selectedSnapshot === 'live' ? 'bg-slate-700/30' : ''
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">Current Season (Live)</span>
                              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                            {selectedSnapshot === 'live' && (
                              <div className="h-2 w-2 rounded-full bg-blue-400" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">Real-time leaderboard</div>
                        </button>

                        {/* Snapshot Options */}
                        {snapshots.map((snapshot) => (
                          <button
                            key={snapshot.id}
                            onClick={() => handleSnapshotChange(snapshot.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors ${selectedSnapshot === snapshot.id ? 'bg-slate-700/30' : ''
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{snapshot.name}</span>
                              {selectedSnapshot === snapshot.id && (
                                <div className="h-2 w-2 rounded-full bg-blue-400" />
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {snapshot.startDate.toLocaleDateString()} - {snapshot.endDate.toLocaleDateString()}
                              {' • '}{snapshot.totalPlayers} players
                            </div>
                          </button>
                        ))}

                        {snapshots.length === 0 && (
                          <div className="px-4 py-3 text-slate-400 text-sm text-center">
                            No historical seasons available
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Summary - Mobile First */}
              <div className="lg:order-2 grid grid-cols-3 lg:flex lg:items-center gap-4 lg:gap-8">
                <div className="text-center">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400 mx-auto lg:mx-0" />
                    <span>{totalPlayers}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">Total Players</div>
                </div>

                <div className="text-center">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    <Swords className="h-5 w-5 lg:h-6 lg:w-6 text-green-400 mx-auto lg:mx-0" />
                    <span>{totalMatches}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">Total Matches</div>
                </div>

                <div className="text-center">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400 mx-auto lg:mx-0" />
                    <span>{averageElo}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">Avg Rating</div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="col-span-3 lg:col-span-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white px-3 py-2 rounded-lg transition-colors text-sm"
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
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8 overflow-visible relative z-0">
          {/* Loading Overlay for Snapshot Changes */}
          {loadingSnapshot && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-30 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-white mb-2">Loading Snapshot</h2>
                <p className="text-slate-400">Fetching historical data...</p>
              </div>
            </div>
          )}

          <div className="space-y-8 sm:space-y-12">
            {/* Top Player Section */}
            {topPlayer && (
              <section>
                <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Champion</h2>
                </div>
                <TopPlayer player={topPlayer} localMap={localMap} />
              </section>
            )}

            {/* Featured Players Section */}
            {featuredPlayers.length > 0 && (
              <section className="overflow-visible">
                <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Top Contenders</h2>
                </div>
                <div className="pb-6">
                  <FeaturedPlayers players={featuredPlayers} localMap={localMap} />
                </div>
              </section>
            )}

            {/* Leaderboard Table Section */}
            {leaderboardPlayers.length > 0 && (
              <section>
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Full Rankings</h2>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-400">
                    <span>Showing ranks 6-{leaderboardPlayers.length + 5}</span>
                    <div className="hidden sm:block h-4 w-px bg-slate-600" />
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
        <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-8 sm:mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-slate-400 text-sm">
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
