import { createPlayer, createMatch, createLocal } from './firebaseService';
import { Player, Match, MatchType } from '@/types';
import { getTierFromElo, generateAvatarUrl } from './utils';

// Popular Yu-Gi-Oh deck archetypes
const deckArchetypes = [
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

const playerNames = [
  "From Iron", "Pentaless", "WindWitch", "KaibaCorp", "VirtualDuel",
  "YugiKing", "DuelMaster", "CardSlinger", "PharaohAtem", "BlueEyesUser",
  "DarkMagician", "RedDragon", "SkyStriker", "DragonLink", "EldlichLord",
  "TriBrigade", "DrytronPilot", "PhantomKnight", "LiveTwin", "Floowandereeze"
];

const localNames = [
  "Downtown Card Shop",
  "Westside Gaming Center", 
  "Northside Comics & Games",
  "Eastside Tournament Hall"
];

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Create locals first
    console.log('Creating locals...');
    const createdLocals: string[] = [];
    
    for (const localName of localNames) {
      const localData = {
        name: localName,
        location: `${localName} Location`,
        description: `Local tournament venue: ${localName}`
      };
      
      const localId = await createLocal(localData);
      createdLocals.push(localId);
      console.log(`Created local: ${localName} (ID: ${localId})`);
    }
    
    // Create players
    console.log('Creating players...');
    const createdPlayers: string[] = [];
    
    for (let i = 0; i < playerNames.length; i++) {
      const name = playerNames[i];
      const elo = Math.floor(Math.random() * 1500) + 1000; // ELO between 1000-2500
      const wins = Math.floor(Math.random() * 200) + 50;
      const losses = Math.floor(Math.random() * 150) + 20;
      const totalMatches = wins + losses;
      const winRate = parseFloat(((wins / totalMatches) * 100).toFixed(1));
      const tier = getTierFromElo(elo);
      const deckArchetype = deckArchetypes[Math.floor(Math.random() * deckArchetypes.length)];
      
      // Randomly assign 1-3 locals to each player
      const numLocals = Math.floor(Math.random() * 3) + 1;
      const shuffledLocals = [...createdLocals].sort(() => 0.5 - Math.random());
      const playerLocals = shuffledLocals.slice(0, numLocals);
      
      const playerData: Omit<Player, 'id'> = {
        name,
        avatar: generateAvatarUrl(name),
        elo,
        rank: 0, // Will be calculated when fetched
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
      
      const playerId = await createPlayer(playerData);
      createdPlayers.push(playerId);
      console.log(`Created player: ${name} (ID: ${playerId})`);
    }
    
    // Create some matches between players
    console.log('Creating matches...');
    const matchTypes = [MatchType.RANKED, MatchType.CASUAL, MatchType.TOURNAMENT];
    
    for (let i = 0; i < 100; i++) {
      const player1Id = createdPlayers[Math.floor(Math.random() * createdPlayers.length)];
      const player2Id = createdPlayers[Math.floor(Math.random() * createdPlayers.length)];
      
      if (player1Id === player2Id) continue;
      
      const winnerId = Math.random() > 0.5 ? player1Id : player2Id;
      const eloChange = Math.floor(Math.random() * 30) + 10; // 10-40 ELO change
      
      const matchData: Omit<Match, 'id'> = {
        player1Id,
        player2Id,
        player1Name: playerNames[createdPlayers.indexOf(player1Id)] || 'Unknown',
        player2Name: playerNames[createdPlayers.indexOf(player2Id)] || 'Unknown',
        player1Deck: deckArchetypes[Math.floor(Math.random() * deckArchetypes.length)],
        player2Deck: deckArchetypes[Math.floor(Math.random() * deckArchetypes.length)],
        winnerId,
        loserElo: Math.floor(Math.random() * 1500) + 1000,
        winnerElo: Math.floor(Math.random() * 1500) + 1000,
        eloChange,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        duration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
        matchType: matchTypes[Math.floor(Math.random() * matchTypes.length)],
        winnerScore: Math.floor(Math.random() * 3) + 1,
        loserScore: Math.floor(Math.random() * 3) + 1
      };
      
      await createMatch(matchData);
    }
    
    console.log('Database seeding completed successfully!');
    console.log(`Created ${createdPlayers.length} players and 100 matches`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Export for use in scripts or admin functions
export default seedDatabase; 