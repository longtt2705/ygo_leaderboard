import { Player } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTierColor, formatElo, formatRecord } from "@/lib/utils";
import { getBossMonsterImage } from "@/lib/constants";
import { LocalBadges } from "@/components/LocalBadges";
import { Crown, Trophy, Swords, Flame, Snowflake } from "lucide-react";
import Link from "next/link";

interface TopPlayerProps {
    player: Player;
    localMap: { [key: string]: string };
}

export function TopPlayer({ player, localMap }: TopPlayerProps) {
    const mainDeck = player.mainDeck || player.decks.find(d => d.isMain)?.archetypeName || 'Unknown';
    const bossMonsterImage = getBossMonsterImage(mainDeck);

    return (
        <Link href={`/player/${player.id}`}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8 text-white shadow-2xl border border-slate-600/50 cursor-pointer hover:scale-105 transition-transform duration-300">
                {/* Boss Monster Background */}
                {bossMonsterImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-15"
                        style={{ backgroundImage: `url(${bossMonsterImage})` }}
                    />
                )}

                {/* Boss Monster Image on Right - Hidden on mobile */}
                {bossMonsterImage && (
                    <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60 blur-sm scale-110"
                            style={{ backgroundImage: `url(${bossMonsterImage})` }}
                        />
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-30"
                            style={{ backgroundImage: `url(${bossMonsterImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-800/80" />
                    </div>
                )}

                {/* Prismatic Rare Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Base prismatic rainbow overlay */}
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 via-purple-400 to-pink-400 animate-prismatic-shift" />

                    {/* Diagonal prismatic lines */}
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                         45deg,
                         transparent,
                         transparent 8px,
                         rgba(255,255,255,0.1) 8px,
                         rgba(255,255,255,0.1) 10px,
                         transparent 10px,
                         transparent 18px,
                         rgba(255,0,128,0.15) 18px,
                         rgba(255,0,128,0.15) 20px,
                         transparent 20px,
                         transparent 28px,
                         rgba(0,255,128,0.15) 28px,
                         rgba(0,255,128,0.15) 30px,
                         transparent 30px,
                         transparent 38px,
                         rgba(128,0,255,0.15) 38px,
                         rgba(128,0,255,0.15) 40px
                       )`
                        }} />

                    {/* Subtle moving shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent transform -skew-x-12 animate-prismatic-shine" />

                    {/* Fine sparkle texture */}
                    <div className="absolute inset-0 opacity-25"
                        style={{
                            backgroundImage: `radial-gradient(circle at 15% 25%, rgba(255,255,255,0.8) 0.5px, transparent 0.5px),
                                        radial-gradient(circle at 85% 75%, rgba(255,0,128,0.6) 0.5px, transparent 0.5px),
                                        radial-gradient(circle at 45% 15%, rgba(0,255,128,0.6) 0.5px, transparent 0.5px),
                                        radial-gradient(circle at 75% 45%, rgba(128,0,255,0.6) 0.5px, transparent 0.5px),
                                        radial-gradient(circle at 25% 85%, rgba(255,255,0,0.6) 0.5px, transparent 0.5px)`,
                            backgroundSize: '80px 80px, 90px 90px, 70px 70px, 85px 85px, 75px 75px',
                            backgroundPosition: '0 0, 20px 20px, 40px 10px, 10px 50px, 60px 30px'
                        }} />
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-white/10" />
                <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Rank Badge */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 backdrop-blur-sm shadow-lg">
                                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <div>
                                <div className="text-4xl sm:text-5xl lg:text-6xl font-black">1</div>
                                <div className="text-xs sm:text-sm font-medium opacity-90">RANK</div>
                            </div>
                        </div>

                        {/* Tier Badge */}
                        <div className={`rounded-lg bg-gradient-to-r ${getTierColor(player.tier)} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold uppercase text-white shadow-lg w-fit`}>
                            <Trophy className="mr-1 sm:mr-2 inline h-3 w-3 sm:h-4 sm:w-4" />
                            {player.tier}
                        </div>
                    </div>

                    {/* Player Info */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white/30 mx-auto sm:mx-0">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback className="bg-white/20 text-xl sm:text-2xl font-bold">
                                {player.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
                                {player.streak !== 0 && (
                                    <div className="flex items-center justify-center sm:justify-start gap-1">
                                        {player.streak > 0 ? (
                                            <>
                                                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                                                <span className="text-sm font-bold text-orange-300">{player.streak}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Snowflake className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                                <span className="text-sm font-bold text-blue-300">{Math.abs(player.streak)}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-base sm:text-lg mt-2">
                                <span className="flex items-center justify-center sm:justify-start gap-1">
                                    <Swords className="h-4 w-4" />
                                    {mainDeck}
                                </span>
                                <div className="flex justify-center sm:justify-start">
                                    <LocalBadges localIds={player.locals} localMap={localMap} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black">{formatElo(player.elo)}</div>
                            <div className="text-xs sm:text-sm opacity-80">Yu-Gi-Oh Points</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black">{formatRecord(player.wins, player.losses)}</div>
                            <div className="text-xs sm:text-sm opacity-80">Win Rate: {player.winRate}%</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black">{player.totalMatches}</div>
                            <div className="text-xs sm:text-sm opacity-80">Total Matches</div>
                        </div>
                    </div>


                </div>
            </div>
        </Link>
    );
} 