import { Player } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LocalBadges } from "@/components/LocalBadges";
import { getTierColor, formatElo } from "@/lib/utils";
import { Medal, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface LeaderboardTableProps {
    players: Player[];
    localMap: { [key: string]: string };
}

interface LeaderboardRowProps {
    player: Player;
    localMap: { [key: string]: string };
}

function LeaderboardRow({ player, localMap }: LeaderboardRowProps) {
    return (
        <tr className="border-b border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/50 transition-colors duration-200">
            {/* Rank */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-300">{player.rank}</span>
                </div>
            </td>

            {/* Player */}
            <td className="px-6 py-4">
                <Link href={`/player/${player.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="h-10 w-10 border-2 border-slate-600/50">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback className="bg-slate-700 text-white font-bold">
                            {player.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-white hover:text-blue-400 transition-colors">{player.name}</div>
                        <div className="text-sm text-slate-400">{player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'No Deck'}</div>
                    </div>
                </Link>
            </td>

            {/* Locals */}
            <td className="px-6 py-4">
                <LocalBadges localIds={player.locals} localMap={localMap} className="text-xs" />
            </td>

            {/* Tier */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center rounded-md bg-gradient-to-r ${getTierColor(player.tier)} px-2 py-1 text-xs font-bold uppercase text-white`}>
                        <Medal className="mr-1 h-3 w-3" />
                        {player.tier}
                    </div>
                </div>
            </td>

            {/* LP */}
            <td className="px-6 py-4">
                <span className="font-bold text-white">{formatElo(player.elo)}</span>
            </td>

            {/* Win Rate */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">{player.winRate}%</span>
                        <div className="text-sm text-slate-400">
                            {player.wins}W {player.losses}L
                        </div>
                    </div>

                    {/* Win Rate Bar */}
                    <div className="w-16">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                style={{ width: `${player.winRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </td>

            {/* Streak */}
            <td className="px-6 py-4">
                {player.streak > 0 ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">{player.streak}W</span>
                    </div>
                ) : player.streak < 0 ? (
                    <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-semibold">{Math.abs(player.streak)}L</span>
                    </div>
                ) : (
                    <span className="text-slate-500">-</span>
                )}
            </td>
        </tr>
    );
}

export function LeaderboardTable({ players, localMap }: LeaderboardTableProps) {
    return (
        <div className="overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/50">
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Rank
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Duelist
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Locals
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Tier
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                YP
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Win Rate
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Streak
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => (
                            <LeaderboardRow key={player.id} player={player} localMap={localMap} />
                        ))}
                    </tbody>
                </table>
            </div>

            {players.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                    <p>No players found in this range.</p>
                </div>
            )}
        </div>
    );
} 