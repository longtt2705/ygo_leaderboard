import { Player, PlayerTier } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTierColor, formatElo, getTierFromElo } from "@/lib/utils";
import { getBossMonsterImage } from "@/lib/constants";
import { LocalBadges } from "@/components/LocalBadges";
import { Medal, Swords, Flame, Snowflake } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface FeaturedPlayersProps {
    players: Player[];
    localMap: { [key: string]: string };
}

interface FeaturedPlayerCardProps {
    player: Player;
    localMap: { [key: string]: string };
}

function FeaturedPlayerCard({ player, localMap }: FeaturedPlayerCardProps) {
    const mainDeck = player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'Unknown';

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "from-yellow-400 to-yellow-600"; // Gold for 1st place
            case 2:
                return "from-gray-300 to-gray-500"; // Silver for 2nd place
            case 3:
                return "from-amber-400 to-amber-600"; // Bronze for 3rd place
            case 4:
                return "from-gray-600 to-gray-800"; // Iron color
            case 5:
                return "from-amber-800 to-yellow-900"; // Wood color
            default:
                return "from-gray-400 to-gray-600";
        }
    };

    return (
        <div className="relative">
            <Link href={`/player/${player.id}`}>
                <div className={`relative mt-4 sm:mt-6 mr-3 sm:mr-6 mb-4 sm:mb-6 rounded-xl bg-slate-800/50 backdrop-blur-sm border-2 border-transparent bg-gradient-to-r ${getTierColor(getTierFromElo(player.lastSeasonElo || 0))} p-0.5 hover:scale-105 transition-all duration-300 cursor-pointer`}>
                    <div className="relative rounded-xl bg-slate-800/90 backdrop-blur-sm h-full w-full">
                        {/* Boss Monster Background */}
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110"
                                style={{ backgroundImage: `url(${getBossMonsterImage(mainDeck)})` }}
                            />
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-55"
                                style={{ backgroundImage: `url(${getBossMonsterImage(mainDeck)})` }}
                            />
                            <div className="absolute inset-0 bg-slate-900/70" />
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/80" />
                        </div>
                        {/* Rank Badge */}
                        <div className="absolute -top-2 -left-2 z-30">
                            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br ${getRankColor(player.rank)} shadow-lg border-2 border-slate-800`}>
                                <span className="text-base sm:text-lg font-black text-white">{player.rank}</span>
                            </div>
                        </div>

                        {/* Tier Badge */}
                        <div className="absolute -top-1 -right-1 z-30">
                            <div className={`rounded-lg bg-gradient-to-r ${getTierColor(player.tier)} px-2 py-1 text-xs font-bold uppercase text-white shadow-lg border border-slate-700`}>
                                <Medal className="mr-1 inline h-3 w-3" />
                                {player.tier}
                            </div>
                        </div>

                        <div className="relative p-4 sm:p-6 pb-6 sm:pb-8 z-10">
                            {/* Player Info */}
                            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="relative mx-auto sm:mx-0">
                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-600/50">
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


                                <div className="min-w-0 flex-1 text-center sm:text-left sm:pl-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <h3 className="truncate text-base sm:text-lg font-bold text-white">{player.name}</h3>
                                        {player.streak !== 0 && (
                                            <div className="flex items-center justify-center sm:justify-start gap-0.5 flex-shrink-0">
                                                {player.streak > 0 ? (
                                                    <>
                                                        <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-400" />
                                                        <span className="text-xs font-bold text-orange-300">{player.streak}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Snowflake className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-400" />
                                                        <span className="text-xs font-bold text-blue-300">{Math.abs(player.streak)}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm text-slate-400 mb-1">
                                        <Swords className="h-3 w-3" />
                                        <span className="truncate">{mainDeck}</span>
                                    </div>
                                    <div className="flex justify-center sm:justify-start h-10">
                                        <LocalBadges localIds={player.locals} localMap={localMap} className="text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-slate-400">Yu-Gi-Oh Points</span>
                                    <span className="font-bold text-white text-sm sm:text-base">{formatElo(player.elo)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-slate-400">Win Rate</span>
                                    <span className="font-bold text-emerald-400 text-sm sm:text-base">{player.winRate}%</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-slate-400">Matches</span>
                                    <span className="text-xs sm:text-sm text-slate-300">{player.wins}W {player.losses}L</span>
                                </div>

                                {/* Win Rate Bar */}
                                <div className="mt-2 sm:mt-3">
                                    <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-slate-700">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                                            style={{ width: `${player.winRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export function FeaturedPlayers({ players, localMap }: FeaturedPlayersProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 pt-2 sm:pt-4 px-1 sm:px-2">
            {players.map((player) => (
                <FeaturedPlayerCard key={player.id} player={player} localMap={localMap} />
            ))}
        </div>
    );
} 