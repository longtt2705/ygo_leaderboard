import { Player, Match, MatchType } from "@/types";
import { getTierFromElo, generateAvatarUrl, rankPlayers } from "./utils";

// Popular Yu-Gi-Oh deck archetypes
export const deckArchetypes = [
  "Blue-Eyes White Dragon",
  "Dark Magician",
  "Elemental HERO",
  "Sky Striker",
  "Salamangreat",
  "Dragon Link",
  "Eldlich",
  "Virtual World",
  "Tri-Brigade",
  "Drytron",
  "Phantom Knights",
  "Live Twin",
  "Floowandereeze",
  "Tearlaments",
  "Spright",
  "Kashtira",
  "Purrely",
  "Rescue-ACE",
  "Fire King",
  "Snake-Eye"
];

// Generate mock players
function generateMockPlayers(): Player[] {
  const playerNames = [
    "I will trade", "C9 Loki", "cant type", "From Iron", "Pentaless",
    "RoseThorn", "ToastyAlex", "Zamudo", "dusklol", "blackpanther",
    "Afflictive", "philip", "Hub1012345", "코어샤", "Samuelinito",
    "YugiKing", "DuelMaster", "CardSlinger", "PharaohAtem", "KaibaCorp",
    "BlueEyesUser", "DarkMagician", "RedDragon", "WindWitch", "SkyStriker",
    "DragonLink", "EldlichLord", "VirtualDuel", "TriBrigade", "DrytronPilot",
    "PhantomKnight", "LiveTwin", "Floowandereeze", "Tearlaments", "Spright"
  ];

  const localIds = ["local-1", "local-2", "local-3", "local-4"];
  
  return playerNames.map((name, index) => {
    const elo = Math.floor(Math.random() * 1500) + 1000; // ELO between 1000-2500
    const wins = Math.floor(Math.random() * 200) + 50;
    const losses = Math.floor(Math.random() * 150) + 20;
    const totalMatches = wins + losses;
    const winRate = parseFloat(((wins / totalMatches) * 100).toFixed(1));
    const tier = getTierFromElo(elo);
    const deckArchetype = deckArchetypes[Math.floor(Math.random() * deckArchetypes.length)];
    
    // Randomly assign 1-3 locals to each player
    const numLocals = Math.floor(Math.random() * 3) + 1;
    const shuffledLocals = [...localIds].sort(() => 0.5 - Math.random());
    const playerLocals = shuffledLocals.slice(0, numLocals);
    
    return {
      id: `player-${index + 1}`,
      name,
      avatar: generateAvatarUrl(`player-${index + 1}`),
      elo,
      rank: 0, // Will be set by rankPlayers function
      wins,
      losses,
      winRate,
      tier,
      locals: playerLocals,
      decks: [{
        archetypeId: `archetype-${Math.floor(Math.random() * deckArchetypes.length)}`,
        archetypeName: deckArchetype,
        isMain: true
      }],
      mainDeck: deckArchetype, // For backward compatibility
      totalMatches,
      streak: Math.floor(Math.random() * 20) - 10, // -10 to +10 streak
      peakElo: elo + Math.floor(Math.random() * 300),
      recentMatches: [] // Will be populated separately
    };
  });
}

// Generate mock matches
function generateMockMatches(players: Player[]): Match[] {
  const matches: Match[] = [];
  const matchTypes = [MatchType.RANKED, MatchType.CASUAL, MatchType.TOURNAMENT];
  
  for (let i = 0; i < 500; i++) {
    const player1 = players[Math.floor(Math.random() * players.length)];
    const player2 = players[Math.floor(Math.random() * players.length)];
    
    if (player1.id === player2.id) continue;
    
    const winnerId = Math.random() > 0.5 ? player1.id : player2.id;
    const eloChange = Math.floor(Math.random() * 30) + 10; // 10-40 ELO change
    
    matches.push({
      id: `match-${i + 1}`,
      player1Id: player1.id,
      player2Id: player2.id,
      player1Name: player1.name,
      player2Name: player2.name,
      player1Deck: player1.mainDeck || player1.decks.find(d => d.isMain)?.archetypeName || 'Unknown',
      player2Deck: player2.mainDeck || player2.decks.find(d => d.isMain)?.archetypeName || 'Unknown',
      winnerId,
      loserElo: winnerId === player1.id ? player2.elo : player1.elo,
      winnerElo: winnerId === player1.id ? player1.elo : player2.elo,
      eloChange,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
      matchType: matchTypes[Math.floor(Math.random() * matchTypes.length)],
      winnerScore: Math.floor(Math.random() * 3) + 1,
      loserScore: Math.floor(Math.random() * 3) + 1
    });
  }
  
  return matches.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Create and export mock data
const rawPlayers = generateMockPlayers();
export const mockMatches = generateMockMatches(rawPlayers);

// Rank players and export
export const mockPlayers = rankPlayers(rawPlayers);

// Add recent matches to players
mockPlayers.forEach(player => {
  player.recentMatches = mockMatches
    .filter(match => match.player1Id === player.id || match.player2Id === player.id)
    .slice(0, 10);
});

// Export specific players for featured display
export const topPlayer = mockPlayers[0];
export const featuredPlayers = mockPlayers.slice(1, 5); // Players ranked 2-5
export const leaderboardPlayers = mockPlayers.slice(5); // Players ranked 6+

// Export leaderboard stats
export const leaderboardStats = {
  totalPlayers: mockPlayers.length,
  averageElo: Math.round(mockPlayers.reduce((sum, p) => sum + p.elo, 0) / mockPlayers.length),
  topPlayerElo: mockPlayers[0]?.elo || 0,
  totalMatches: mockMatches.length,
  mostPlayedDeck: deckArchetypes[0] // Simplified for demo
}; 