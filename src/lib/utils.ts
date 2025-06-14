import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player, PlayerTier, EloCalculation } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ELO calculation system with bonuses
export function calculateElo(
  winnerElo: number,
  loserElo: number,
  kFactor: number = 32,
  winnerScore: number = 2,
  loserScore: number = 0,
  winnerStreak: number = 0
): EloCalculation {
  // Expected scores
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  // Base ELO change
  const baseWinnerChange = kFactor * (1 - expectedWinner);
  const baseLoserChange = kFactor * (0 - expectedLoser);

  // Bonus for 2-0 victory (dominant win)
  let dominantWinBonus = 0;
  if (winnerScore === 2 && loserScore === 0) {
    dominantWinBonus = Math.round(kFactor * 0.15); // 15% bonus for 2-0
  }

  // Win streak bonus (increases with longer streaks)
  let streakBonus = 0;
  if (winnerStreak > 0) {
    // Bonus increases with streak length, capped at 10 games
    const streakMultiplier = Math.min(winnerStreak, 10) * 0.05; // 5% per game in streak, max 50%
    streakBonus = Math.round(kFactor * streakMultiplier);
  }

  // Apply bonuses to winner
  const totalWinnerChange = Math.round(baseWinnerChange + dominantWinBonus + streakBonus);
  const newWinnerElo = Math.round(winnerElo + totalWinnerChange);
  const newLoserElo = Math.round(loserElo + baseLoserChange);

  return {
    newWinnerElo,
    newLoserElo,
    eloChange: totalWinnerChange,
    dominantWinBonus,
    streakBonus
  };
}

// Determine tier based on ELO
export function getTierFromElo(elo: number): PlayerTier {
  if (elo >= 2400) return PlayerTier.CHALLENGER;  // 2400+ YP
  if (elo >= 2200) return PlayerTier.GRANDMASTER; // 2200-2399 YP
  if (elo >= 2000) return PlayerTier.MASTER;      // 2000-2199 YP
  if (elo >= 1800) return PlayerTier.DIAMOND;     // 1800-1999 YP
  if (elo >= 1600) return PlayerTier.PLATINUM;    // 1600-1799 YP
  if (elo >= 1400) return PlayerTier.GOLD;        // 1400-1599 YP
  if (elo >= 1200) return PlayerTier.SILVER;      // 1200-1399 YP
  return PlayerTier.BRONZE;                       // 1000-1199 YP
}

// Get tier color
export function getTierColor(tier: PlayerTier): string {
  switch (tier) {
    case PlayerTier.CHALLENGER:
      return "from-red-500 to-orange-500";
    case PlayerTier.GRANDMASTER:
      return "from-purple-500 to-pink-500";
    case PlayerTier.MASTER:
      return "from-blue-500 to-purple-500";
    case PlayerTier.DIAMOND:
      return "from-cyan-500 to-blue-500";
    case PlayerTier.PLATINUM:
      return "from-green-500 to-cyan-500";
    case PlayerTier.GOLD:
      return "from-yellow-500 to-orange-500";
    case PlayerTier.SILVER:
      return "from-gray-400 to-gray-600";
    case PlayerTier.BRONZE:
      return "from-amber-600 to-amber-800";
    default:
      return "from-gray-400 to-gray-600";
  }
}

// Format win rate as percentage
export function formatWinRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total === 0) return "0%";
  return `${Math.round((wins / total) * 100)}%`;
}

// Format ELO display
export function formatElo(elo: number): string {
  return `${elo.toLocaleString()}`;
}

// Format match record
export function formatRecord(wins: number, losses: number): string {
  return `${wins}W ${losses}L`;
}

// Calculate K-factor based on player tier and matches played
export function getKFactor(elo: number, matchesPlayed: number): number {
  // New players get higher K-factor for faster rating changes
  if (matchesPlayed < 30) return 40;
  
  // High-rated players get lower K-factor for stability
  if (elo >= 2400) return 16;
  if (elo >= 2100) return 24;
  
  return 32;
}

// Generate random avatar URL (placeholder)
export function generateAvatarUrl(playerId: string): string {
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  ];
  
  const index = parseInt(playerId.slice(-1), 16) % avatars.length;
  return avatars[index];
}

// Sort players by ELO (descending) and assign ranks
export function rankPlayers(players: Player[]): Player[] {
  return players
    .sort((a, b) => b.elo - a.elo)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}

// Get recent match trend (for streak visualization)
export function getMatchTrend(matches: { winnerId: string }[], playerId: string): string[] {
  return matches
    .slice(-10) // Last 10 matches
    .map(match => match.winnerId === playerId ? 'W' : 'L');
} 