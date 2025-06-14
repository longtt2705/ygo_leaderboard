import { notFound } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getPlayer, getPlayerMatches, getAllLocals } from "@/lib/firebaseService";
import { getTierColor, formatElo, formatRecord, getMatchTrend } from "@/lib/utils";
import { getBossMonsterImage } from "@/lib/constants";
import { LocalBadges } from "@/components/LocalBadges";
import { Calendar, Swords, TrendingUp, TrendingDown, ArrowLeft, Medal } from "lucide-react";
import { Match, Local } from "@/types";
import Link from "next/link";

interface PlayerProfileProps {
    params: Promise<{ id: string }>;
}

export default async function PlayerProfile({ params }: PlayerProfileProps) {
    const { id } = await params;

    let player = null;
    let playerMatches: Match[] = [];
    let locals: Local[] = [];

    try {
        [player, playerMatches, locals] = await Promise.all([
            getPlayer(id),
            getPlayerMatches(id, 10),
            getAllLocals()
        ]);
    } catch (error) {
        console.error('Error fetching player data:', error);
        // Try to get at least the player data
        try {
            player = await getPlayer(id);
        } catch (playerError) {
            console.error('Error fetching player:', playerError);
        }
    }

    // Create local name mapping
    const localMap: { [key: string]: string } = {};
    locals.forEach(local => {
        localMap[local.id] = local.name;
    });

    if (!player) {
        notFound();
    }

    const mainDeck = player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'Unknown';
    const recentTrend = getMatchTrend(playerMatches, player.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10">
                {/* Header */}
                <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-6 py-6">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Leaderboard
                        </Link>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-6 py-8">
                    <div className="space-y-8">
                        {/* Player Header */}
                        <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8">
                            {/* Boss Monster Background */}
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm"
                                style={{ backgroundImage: `url(${getBossMonsterImage(mainDeck)})` }}
                            />
                            <div className="absolute inset-0 bg-slate-900/60" />
                            <div className="relative z-10">
                                <div className="flex items-start gap-6">
                                    <Avatar className="h-24 w-24 border-4 border-slate-600/50">
                                        <AvatarImage src={player.avatar} alt={player.name} />
                                        <AvatarFallback className="bg-slate-700 text-white text-2xl font-bold">
                                            {player.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h1 className="text-4xl font-bold text-white">{player.name}</h1>
                                            <div className="flex items-center gap-2 text-2xl font-bold text-slate-300">
                                                #{player.rank}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-4">
                                            <div className={`inline-flex items-center rounded-lg bg-gradient-to-r ${getTierColor(player.tier)} px-3 py-1 text-sm font-bold uppercase text-white`}>
                                                <Medal className="mr-2 h-4 w-4" />
                                                {player.tier}
                                            </div>
                                            <LocalBadges localIds={player.locals} localMap={localMap} className="text-xs" />
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Swords className="h-4 w-4" />
                                                {mainDeck}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-6">
                                            <div>
                                                <div className="text-2xl font-bold text-white">{formatElo(player.elo)}</div>
                                                <div className="text-sm text-slate-400">Yu-Gi-Oh Points</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-emerald-400">{player.winRate}%</div>
                                                <div className="text-sm text-slate-400">Win Rate</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{formatRecord(player.wins, player.losses)}</div>
                                                <div className="text-sm text-slate-400">Match Record</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">{formatElo(player.peakElo)}</div>
                                                <div className="text-sm text-slate-400">Peak Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Form */}
                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">Recent Form</h3>
                                    <div className="flex items-center gap-1">
                                        {recentTrend.map((result, index) => (
                                            <div
                                                key={index}
                                                className={`h-6 w-6 rounded-sm flex items-center justify-center text-xs font-bold ${result === 'W'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                    }`}
                                            >
                                                {result}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Match History */}
                        <div className="overflow-hidden rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
                            <div className="px-6 py-4 border-b border-slate-700/50">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Matches
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {playerMatches.map((match) => {
                                        const isWinner = match.winnerId === player.id;
                                        const opponent = match.player1Id === player.id ? match.player2Name : match.player1Name;
                                        const opponentDeck = match.player1Id === player.id ? match.player2Deck : match.player1Deck;

                                        return (
                                            <div
                                                key={match.id}
                                                className={`flex items-center justify-between p-4 rounded-lg border ${isWinner
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-red-500/10 border-red-500/30'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-red-500'
                                                        }`}>
                                                        {isWinner ? (
                                                            <TrendingUp className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {isWinner ? 'Victory' : 'Defeat'} vs {opponent} ({match.winnerScore} - {match.loserScore})
                                                        </div>
                                                        <div className="text-sm text-slate-400">
                                                            {mainDeck} vs {opponentDeck}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`font-bold ${isWinner ? 'text-emerald-400' : 'text-red-400'
                                                        }`}>
                                                        {isWinner ? '+' : '-'}{match.eloChange} YP
                                                    </div>
                                                    {isWinner && (match.dominantWinBonus || match.streakBonus) && (
                                                        <div className="text-xs text-yellow-400">
                                                            {match.dominantWinBonus && match.dominantWinBonus > 0 && (
                                                                <span className="mr-1">2-0 Bonus: +{match.dominantWinBonus}</span>
                                                            )}
                                                            {match.streakBonus && match.streakBonus > 0 && (
                                                                <span>Streak Bonus: +{match.streakBonus}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="text-sm text-slate-400">
                                                        {match.date.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
} 