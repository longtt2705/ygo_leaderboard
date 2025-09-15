import { Player, PlayerTier } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LocalBadges } from "@/components/LocalBadges";
import { getTierColor, formatElo, getTierFromElo } from "@/lib/utils";
import { Medal, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
            <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl font-bold text-slate-300">{player.rank}</span>
                </div>
            </td>

            {/* Player */}
            <td className="px-3 sm:px-6 py-3 sm:py-4">
                <Link href={`/player/${player.id}`} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative mx-auto sm:mx-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-slate-600/50">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback className="bg-slate-700 text-white font-bold text-xs sm:text-sm">
                                {player.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {getTierFromElo(player.lastSeasonElo || 0) !== PlayerTier.WOOD &&
                            (<div className="absolute inset-0 top-[20%] left-[50%] -translate-x-[50%] -translate-y-[50%] pointer-events-none">
                                <Image
                                    src={`/${getTierFromElo(player.lastSeasonElo || 0).toString().toLowerCase()}.webp`}
                                    alt={`${getTierFromElo(player.lastSeasonElo || 0).toString().toLowerCase()} Frame`}
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-contain scale-550"
                                />
                            </div>)}
                    </div>
                    <div className="text-center sm:text-left pl-2">
                        <div className="font-semibold text-white hover:text-blue-400 transition-colors text-sm sm:text-base">{player.name}</div>
                        <div className="text-xs sm:text-sm text-slate-400 hidden sm:block">{player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'No Deck'}</div>
                    </div>
                </Link>
            </td>

            {/* Locals - Hidden on mobile */}
            <td className="hidden md:table-cell px-6 py-4">
                <LocalBadges localIds={player.locals} localMap={localMap} className="text-xs" />
            </td>

            {/* Tier */}
            <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center rounded-md bg-gradient-to-r ${getTierColor(player.tier)} px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold uppercase text-white`}>
                        <Medal className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">{player.tier}</span>
                        <span className="sm:hidden">{player.tier.charAt(0)}</span>
                    </div>
                </div>
            </td>

            {/* LP */}
            <td className="px-3 sm:px-6 py-3 sm:py-4">
                <span className="font-bold text-white text-sm sm:text-base">{formatElo(player.elo)}</span>
            </td>

            {/* Win Rate */}
            <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-emerald-400 text-sm sm:text-base">{player.winRate}%</span>
                        <div className="text-xs sm:text-sm text-slate-400">
                            {player.wins}W {player.losses}L
                        </div>
                    </div>

                    {/* Win Rate Bar - Hidden on mobile */}
                    <div className="hidden sm:block w-12 sm:w-16">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                style={{ width: `${player.winRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </td>

            {/* Streak - Hidden on mobile */}
            <td className="hidden lg:table-cell px-6 py-4">
                <div className="flex items-center gap-2">
                    {player.streak > 0 ? (
                        <>
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <span className="font-bold text-emerald-400">+{player.streak}</span>
                        </>
                    ) : player.streak < 0 ? (
                        <>
                            <TrendingDown className="h-4 w-4 text-red-400" />
                            <span className="font-bold text-red-400">{player.streak}</span>
                        </>
                    ) : (
                        <span className="text-slate-400">-</span>
                    )}
                </div>
            </td>
        </tr>
    );
}

// Mobile Card Component
function LeaderboardCard({ player, localMap }: LeaderboardRowProps) {
    return (
        <Link href={`/player/${player.id}`}>
            <div className="bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg p-4 transition-colors duration-200 my-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-300">#{player.rank}</span>
                </div>
                <div className="flex items-center mb-3">
                    <div className="relative mx-auto sm:mx-0">
                        <Avatar className="h-10 w-10 border-2 border-slate-600/50">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback className="bg-slate-700 text-white font-bold">
                                {player.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {getTierFromElo(player.lastSeasonElo || 0) !== PlayerTier.WOOD &&
                            (<div className="absolute inset-0 top-[20%] left-[50%] -translate-x-[50%] -translate-y-[50%] pointer-events-none">
                                <Image
                                    src={`/${getTierFromElo(player.lastSeasonElo || 0).toString().toLowerCase()}.webp`}
                                    alt={`${getTierFromElo(player.lastSeasonElo || 0).toString().toLowerCase()} Frame`}
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-contain scale-550"
                                />
                            </div>)}
                    </div>
                </div>
                <div className="flex flex-col gap-2 items-center justify-between">

                    <div className="flex-1 min-w-0 text-center">
                        <div className="font-semibold text-white hover:text-blue-400 transition-colors">{player.name}</div>
                        <div className="text-sm text-slate-400">{player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'No Deck'}</div>
                    </div>

                    <div className={`inline-flex items-center rounded-md bg-gradient-to-r ${getTierColor(player.tier)} px-2 py-1 text-xs font-bold uppercase text-white`}>
                        <Medal className="mr-1 h-3 w-3" />
                        {player.tier}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="font-bold text-white">{formatElo(player.elo)}</div>
                        <div className="text-xs text-slate-400">YP</div>
                    </div>
                    <div>
                        <div className="font-semibold text-emerald-400">{player.winRate}%</div>
                        <div className="text-xs text-slate-400">{player.wins}W {player.losses}L</div>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-1">
                            {player.streak > 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                                    <span className="font-bold text-emerald-400 text-sm">+{player.streak}</span>
                                </>
                            ) : player.streak < 0 ? (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-400" />
                                    <span className="font-bold text-red-400 text-sm">{player.streak}</span>
                                </>
                            ) : (
                                <span className="text-slate-400 text-sm">-</span>
                            )}
                        </div>
                        <div className="text-xs text-slate-400">Streak</div>
                    </div>
                </div>

                <div className="mt-3 text-center">
                    <LocalBadges localIds={player.locals} localMap={localMap} className="text-xs" />
                </div>

                {/* Win Rate Bar */}
                <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            style={{ width: `${player.winRate}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function LeaderboardTable({ players, localMap }: LeaderboardTableProps) {
    return (
        <div className="overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/50">
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                                Rank
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                                Duelist
                            </th>
                            <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
                                Locals
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                                Tier
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                                YP
                            </th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                                Win Rate
                            </th>
                            <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-slate-300">
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

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-4">
                {players.map((player) => (
                    <LeaderboardCard key={player.id} player={player} localMap={localMap} />
                ))}
            </div>

            {players.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                    <p>No players found in this range.</p>
                </div>
            )}
        </div>
    );
} 