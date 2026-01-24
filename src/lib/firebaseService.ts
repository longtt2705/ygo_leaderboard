import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Match, PlayerTier, Local, DeckArchetype, Snapshot, SeasonConfig } from '@/types';

// Collections
const PLAYERS_COLLECTION = 'players';
const MATCHES_COLLECTION = 'matches';
const LOCALS_COLLECTION = 'locals';
const DECK_ARCHETYPES_COLLECTION = 'deckArchetypes';
const SNAPSHOTS_COLLECTION = 'snapshots';

// Player CRUD Operations
export async function createPlayer(playerData: Omit<Player, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), {
      ...playerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, playerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Player;
    }
    return null;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
}

export async function getAllPlayers(): Promise<Player[]> {
  try {
    const q = query(
      collection(db, PLAYERS_COLLECTION), 
      orderBy('elo', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const allPlayers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Player[];
    
    // Separate ranked and unranked players
    const rankedPlayers = allPlayers.filter(p => p.totalMatches > 5);
    const unrankedPlayers = allPlayers.filter(p => p.totalMatches <= 5);
    
    // Sort unranked players by last season rank, then last season ELO, then name
    const sortedUnranked = unrankedPlayers.sort((a, b) => {
      // If both have last season rank, sort by it
      if (a.lastSeasonRank && b.lastSeasonRank) {
        return a.lastSeasonRank - b.lastSeasonRank;
      }
      // If only one has last season rank, that one comes first
      if (a.lastSeasonRank) return -1;
      if (b.lastSeasonRank) return 1;
      
      // If both have last season ELO, sort by it (higher ELO first)
      if (a.lastSeasonElo && b.lastSeasonElo) {
        return b.lastSeasonElo - a.lastSeasonElo;
      }
      // If only one has last season ELO, that one comes first
      if (a.lastSeasonElo) return -1;
      if (b.lastSeasonElo) return 1;
      
      // Neither has last season data, sort alphabetically
      return a.name.localeCompare(b.name);
    });
    
    // Assign ranks to ranked players only
    const rankedWithRanks = rankedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    }));
    
    // Assign rank 0 to unranked players
    const unrankedWithRanks = sortedUnranked.map((player) => ({
      ...player,
      rank: 0
    }));
    
    // Return ranked players first, then unranked
    return [...rankedWithRanks, ...unrankedWithRanks];
  } catch (error) {
    console.error('Error getting players:', error);
    throw error;
  }
}

export async function updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, playerId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating player:', error);
    throw error;
  }
}

export async function deletePlayer(playerId: string): Promise<void> {
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, playerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting player:', error);
    throw error;
  }
}

// Match CRUD Operations
export async function createMatch(matchData: Omit<Match, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MATCHES_COLLECTION), {
      ...matchData,
      date: matchData.date instanceof Date ? Timestamp.fromDate(matchData.date) : matchData.date,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

export async function getPlayerMatches(playerId: string, limitCount: number = 10): Promise<Match[]> {
  try {
    // Query for matches where player is player1
    const q1 = query(
      collection(db, MATCHES_COLLECTION),
      where('player1Id', '==', playerId)
    );
    
    // Query for matches where player is player2
    const q2 = query(
      collection(db, MATCHES_COLLECTION),
      where('player2Id', '==', playerId)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const matches1 = snapshot1.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Date ? doc.data().date : doc.data().date.toDate()
    })) as Match[];
    
    const matches2 = snapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date instanceof Date ? doc.data().date : doc.data().date.toDate()
    })) as Match[];

    // Combine, sort by date, and limit
    const allMatches = [...matches1, ...matches2];
    return allMatches
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting player matches:', error);
    // Return empty array instead of throwing to prevent 404
    return [];
  }
}

export async function getAllMatches(): Promise<Match[]> {
  try {
    const q = query(
      collection(db, MATCHES_COLLECTION), 
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Match[];
  } catch (error) {
    console.error('Error getting matches:', error);
    throw error;
  }
}

// Real-time listeners
export function subscribeToPlayers(callback: (players: Player[]) => void) {
  const q = query(
    collection(db, PLAYERS_COLLECTION), 
    orderBy('elo', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const players = querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      rank: index + 1
    })) as Player[];
    callback(players);
  });
}

export function subscribeToPlayerMatches(playerId: string, callback: (matches: Match[]) => void) {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('player1Id', '==', playerId),
    orderBy('date', 'desc'),
    limit(10)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const matches = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    })) as Match[];
    callback(matches);
  });
}

// User-specific operations
export async function getPlayerByUserId(userId: string): Promise<Player | null> {
  try {
    const q = query(
      collection(db, PLAYERS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Player;
    }
    return null;
  } catch (error) {
    console.error('Error getting player by user ID:', error);
    throw error;
  }
}

export async function createPlayerProfile(userId: string, playerData: {
  name: string;
  deckArchetype: string;
  locals: string[];
  avatar?: string;
}): Promise<string> {
  const newPlayer: Omit<Player, 'id'> = {
    userId,
    name: playerData.name,
    decks: [{
      archetypeId: '',
      archetypeName: playerData.deckArchetype,
      isMain: true
    }],
    mainDeck: playerData.deckArchetype, // For backward compatibility
    locals: playerData.locals,
    avatar: playerData.avatar || '',
    elo: 1200, // Starting ELO
    tier: PlayerTier.SILVER,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalMatches: 0,
    streak: 0,
    peakElo: 1200,
    rank: 0, // Will be calculated when fetched
    recentMatches: []
    // Don't include lastSeasonElo, lastSeasonPeakElo, lastSeasonRank for new players
    // They will be undefined/optional and Firestore doesn't accept undefined values
  };

  return await createPlayer(newPlayer);
}

// Local CRUD Operations
export async function createLocal(localData: Omit<Local, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, LOCALS_COLLECTION), {
      ...localData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating local:', error);
    throw error;
  }
}

export async function getAllLocals(): Promise<Local[]> {
  try {
    const q = query(collection(db, LOCALS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Local[];
  } catch (error) {
    console.error('Error getting locals:', error);
    throw error;
  }
}

export async function updateLocal(localId: string, updates: Partial<Local>): Promise<void> {
  try {
    const docRef = doc(db, LOCALS_COLLECTION, localId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating local:', error);
    throw error;
  }
}

export async function deleteLocal(localId: string): Promise<void> {
  try {
    const docRef = doc(db, LOCALS_COLLECTION, localId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting local:', error);
    throw error;
  }
}

// Deck Archetype CRUD Operations
export async function createDeckArchetype(archetypeData: Omit<DeckArchetype, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, DECK_ARCHETYPES_COLLECTION), {
      ...archetypeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating deck archetype:', error);
    throw error;
  }
}

export async function getAllDeckArchetypes(): Promise<DeckArchetype[]> {
  try {
    const q = query(collection(db, DECK_ARCHETYPES_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DeckArchetype[];
  } catch (error) {
    console.error('Error getting deck archetypes:', error);
    throw error;
  }
}

export async function updateDeckArchetype(archetypeId: string, updates: Partial<DeckArchetype>): Promise<void> {
  try {
    const docRef = doc(db, DECK_ARCHETYPES_COLLECTION, archetypeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating deck archetype:', error);
    throw error;
  }
}

export async function deleteDeckArchetype(archetypeId: string): Promise<void> {
  try {
    const docRef = doc(db, DECK_ARCHETYPES_COLLECTION, archetypeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting deck archetype:', error);
    throw error;
  }
}

// Utility function to get local names by IDs
export async function getLocalsByIds(localIds: string[]): Promise<{ [key: string]: string }> {
  try {
    if (localIds.length === 0) return {};
    
    const localMap: { [key: string]: string } = {};
    const locals = await getAllLocals();
    
    locals.forEach(local => {
      if (localIds.includes(local.id)) {
        localMap[local.id] = local.name;
      }
    });
    
    return localMap;
  } catch (error) {
    console.error('Error getting locals by IDs:', error);
    return {};
  }
}

// Recalculate all player rankings based on current ELO
export async function recalculateRankings(): Promise<void> {
  try {
    // Get all players sorted by ELO
    const players = await getAllPlayers();
    
    // Separate ranked and unranked players
    const rankedPlayers = players.filter(p => p.totalMatches > 5);
    const unrankedPlayers = players.filter(p => p.totalMatches <= 5);
    
    // Update ranked players with proper ranks
    const rankedUpdatePromises = rankedPlayers.map((player, index) => 
      updatePlayer(player.id, { rank: index + 1 })
    );
    
    // Update unranked players with rank 0
    const unrankedUpdatePromises = unrankedPlayers.map((player) => 
      updatePlayer(player.id, { rank: 0 })
    );
    
    await Promise.all([...rankedUpdatePromises, ...unrankedUpdatePromises]);
    console.log(`Rankings recalculated successfully - ${rankedPlayers.length} ranked, ${unrankedPlayers.length} unranked`);
  } catch (error) {
    console.error('Error recalculating rankings:', error);
    throw error;
  }
}

// Sync player stats with actual match history
export async function syncPlayerStats(): Promise<void> {
  try {
    console.log('Starting sync operation...');
    
    const [players, matches] = await Promise.all([
      getAllPlayers(),
      getAllMatches()
    ]);
    
    console.log(`Found ${players.length} players and ${matches.length} matches`);

    const playerStats: { [playerId: string]: {
      wins: number;
      losses: number;
      totalMatches: number;
      winRate: number;
      currentStreak: number;
      recentMatches: Match[];
    }} = {};

    // Initialize stats for all players
    players.forEach(player => {
      playerStats[player.id] = {
        wins: 0,
        losses: 0,
        totalMatches: 0,
        winRate: 0,
        currentStreak: 0,
        recentMatches: []
      };
    });

    // Calculate stats from matches
    matches.forEach(match => {
      const { player1Id, player2Id, winnerId } = match;
      
      // Ensure match has a proper date
      const matchWithDate = {
        ...match,
        date: match.date instanceof Date ? match.date : new Date(match.date)
      };
      
      if (playerStats[player1Id]) {
        playerStats[player1Id].totalMatches++;
        playerStats[player1Id].recentMatches.push(matchWithDate);
        if (winnerId === player1Id) {
          playerStats[player1Id].wins++;
        } else {
          playerStats[player1Id].losses++;
        }
      }
      
      if (playerStats[player2Id]) {
        playerStats[player2Id].totalMatches++;
        playerStats[player2Id].recentMatches.push(matchWithDate);
        if (winnerId === player2Id) {
          playerStats[player2Id].wins++;
        } else {
          playerStats[player2Id].losses++;
        }
      }
    });

    // Calculate win rates and streaks
    Object.keys(playerStats).forEach(playerId => {
      const stats = playerStats[playerId];
      stats.winRate = stats.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 100) : 0;
      
      // Calculate current streak from recent matches
      const playerMatches = stats.recentMatches
        .filter(match => match.player1Id === playerId || match.player2Id === playerId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      let streak = 0;
      let lastResult: 'W' | 'L' | null = null;
      
      for (const match of playerMatches) {
        const isWin = match.winnerId === playerId;
        const currentResult = isWin ? 'W' : 'L';
        
        if (lastResult === null) {
          lastResult = currentResult;
          streak = isWin ? 1 : -1;
        } else if (lastResult === currentResult) {
          streak = isWin ? streak + 1 : streak - 1;
        } else {
          break;
        }
      }
      
      stats.currentStreak = streak;
    });

    // Update all players with corrected stats
    const updatePromises = players.map(player => {
      const stats = playerStats[player.id];
      return updatePlayer(player.id, {
        wins: stats.wins,
        losses: stats.losses,
        totalMatches: stats.totalMatches,
        winRate: stats.winRate,
        streak: stats.currentStreak
      });
    });

    await Promise.all(updatePromises);
    
    // Recalculate rankings after syncing stats
    await recalculateRankings();
    
    console.log('Player stats synced successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// Snapshot CRUD Operations
export async function createSnapshot(snapshotData: {
  name: string;
  startDate: Date;
  endDate: Date;
}): Promise<string> {
  try {
    // Get current players data
    const players = await getAllPlayers();
    const matches = await getAllMatches();
    
    // Calculate metadata
    const totalPlayers = players.length;
    const averageElo = totalPlayers > 0 ? Math.round(players.reduce((sum, p) => sum + p.elo, 0) / totalPlayers) : 0;
    const topPlayerElo = totalPlayers > 0 ? Math.max(...players.map(p => p.elo)) : 0;
    const totalMatches = matches.length;
    
    // Find most played deck
    const deckCounts: { [deck: string]: number } = {};
    players.forEach(player => {
      const deck = player.mainDeck || 'Unknown';
      deckCounts[deck] = (deckCounts[deck] || 0) + 1;
    });
    const mostPlayedDeck = Object.keys(deckCounts).reduce((a, b) => 
      deckCounts[a] > deckCounts[b] ? a : b, 'Unknown'
    );

    const snapshot: Omit<Snapshot, 'id'> = {
      name: snapshotData.name,
      startDate: snapshotData.startDate,
      endDate: snapshotData.endDate,
      createdAt: new Date(),
      totalPlayers,
      players: players.map(player => ({
        ...player,
        // Ensure dates are properly formatted
        recentMatches: player.recentMatches?.map(match => ({
          ...match,
          date: match.date instanceof Date ? match.date : new Date(match.date)
        })) || []
      })),
      metadata: {
        averageElo,
        topPlayerElo,
        totalMatches,
        mostPlayedDeck
      }
    };

    const docRef = await addDoc(collection(db, SNAPSHOTS_COLLECTION), {
      ...snapshot,
      startDate: Timestamp.fromDate(snapshot.startDate),
      endDate: Timestamp.fromDate(snapshot.endDate),
      createdAt: serverTimestamp(),
      // Convert player data for storage
      players: snapshot.players.map(player => ({
        ...player,
        recentMatches: player.recentMatches?.map(match => ({
          ...match,
          date: Timestamp.fromDate(match.date)
        })) || []
      }))
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating snapshot:', error);
    throw error;
  }
}

export async function getAllSnapshots(): Promise<Snapshot[]> {
  try {
    const q = query(collection(db, SNAPSHOTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        players: data.players?.map((player: Player & { recentMatches: (Match & { date: Timestamp })[] }) => ({
          ...player,
          recentMatches: player.recentMatches?.map((match: Match & { date: Timestamp }) => ({
            ...match,
            date: match.date.toDate()
          })) || []
        })) || []
      } as Snapshot;
    });
  } catch (error) {
    console.error('Error getting snapshots:', error);
    throw error;
  }
}

export async function getSnapshot(snapshotId: string): Promise<Snapshot | null> {
  try {
    const docRef = doc(db, SNAPSHOTS_COLLECTION, snapshotId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        players: data.players?.map((player: Player & { recentMatches: (Match & { date: Timestamp })[] }) => ({
          ...player,
          recentMatches: player.recentMatches?.map((match: Match & { date: Timestamp }) => ({
            ...match,
            date: match.date.toDate()
          })) || []
        })) || []
      } as Snapshot;
    }
    return null;
  } catch (error) {
    console.error('Error getting snapshot:', error);
    throw error;
  }
}

export async function deleteSnapshot(snapshotId: string): Promise<void> {
  try {
    const docRef = doc(db, SNAPSHOTS_COLLECTION, snapshotId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    throw error;
  }
}

// Reset all players to default values
export async function resetAllPlayersToDefault(): Promise<void> {
  try {
    console.log('Starting reset operation...');
    
    const players = await getAllPlayers();
    console.log(`Found ${players.length} players to reset`);

    // Default values
    const defaultElo = 1200;
    const defaultTier = PlayerTier.SILVER;
    const defaultWins = 0;
    const defaultLosses = 0;
    const defaultWinRate = 0;
    const defaultTotalMatches = 0;
    const defaultStreak = 0;
    const defaultRecentMatches: Match[] = [];

    // Update all players with default values, but preserve last season data
    const updatePromises = players.map((player, index) => 
      updatePlayer(player.id, {
        elo: defaultElo,
        tier: defaultTier,
        wins: defaultWins,
        losses: defaultLosses,
        winRate: defaultWinRate,
        totalMatches: defaultTotalMatches,
        streak: defaultStreak,
        peakElo: defaultElo, // Reset peak ELO to default as well
        rank: index + 1, // Assign ranks 1, 2, 3... (will be recalculated anyway)
        recentMatches: defaultRecentMatches,
        // Preserve last season data - don't reset these fields
        lastSeasonElo: player.elo,
        lastSeasonPeakElo: player.peakElo,
        lastSeasonRank: player.rank
      })
    );

    await Promise.all(updatePromises);
    
    // Recalculate rankings after reset (though they should all be the same ELO now)
    await recalculateRankings();
    
    console.log('All players reset to default values successfully');
  } catch (error) {
    console.error('Reset failed:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// Start a new season - save current stats as last season and reset current stats
export async function getCurrentSeasonNumber(): Promise<number> {
  try {
    const snapshots = await getAllSnapshots();
    // Current season number is the total number of snapshots + 1
    return snapshots.length + 1;
  } catch (error) {
    console.error('Error getting current season number:', error);
    return 1; // Default to season 1 if error
  }
}

// Create a snapshot of the current season
export async function createSeasonSnapshot(config: SeasonConfig): Promise<string> {
  try {
    const players = await getAllPlayers();
    const matches = await getAllMatches();
    
    // Calculate metadata
    const totalPlayers = players.length;
    const totalMatches = matches.length;
    const averageElo = totalPlayers > 0 
      ? players.reduce((sum, p) => sum + p.elo, 0) / totalPlayers 
      : 0;
    const topPlayer = players.length > 0 
      ? players.reduce((top, p) => p.elo > top.elo ? p : top, players[0]) 
      : null;
    const topPlayerElo = topPlayer?.elo || 0;
    
    // Count deck usage
    const deckCounts: { [key: string]: number } = {};
    players.forEach(player => {
      const mainDeck = player.mainDeck || player.decks[0]?.archetypeName || 'Unknown';
      deckCounts[mainDeck] = (deckCounts[mainDeck] || 0) + 1;
    });
    const mostPlayedDeck = Object.entries(deckCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    
    const snapshotData = {
      name: config.seasonName,
      startDate: config.startDate,
      endDate: config.endDate || new Date(),
      createdAt: serverTimestamp(),
      totalPlayers,
      players,
      metadata: {
        averageElo,
        topPlayerElo,
        totalMatches,
        mostPlayedDeck
      }
    };
    
    const snapshotId = await createSnapshot(snapshotData);
    console.log(`Season snapshot created: ${snapshotId}`);
    return snapshotId;
  } catch (error) {
    console.error('Error creating season snapshot:', error);
    throw error;
  }
}

// Reset player data for new season
export async function resetSeasonData(config: SeasonConfig): Promise<void> {
  try {
    const players = await getAllPlayers();
    
    const resetElo = config.resetElo || 1200;
    const resetTier = config.resetTier || PlayerTier.SILVER;
    const preservePeakElo = config.preservePeakElo !== false;
    
    const updatePromises = players.map((player, index) => 
      updatePlayer(player.id, {
        elo: resetElo,
        tier: resetTier,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalMatches: 0,
        streak: 0,
        peakElo: preservePeakElo ? player.peakElo : resetElo,
        rank: index + 1,
        recentMatches: [],
        lastSeasonElo: player.elo,
        lastSeasonPeakElo: player.peakElo,
        lastSeasonRank: player.rank
      })
    );
    
    await Promise.all(updatePromises);
    await recalculateRankings();
    
    console.log('Season data reset successfully');
  } catch (error) {
    console.error('Error resetting season data:', error);
    throw error;
  }
}

// Start a new season (with optional snapshot)
export async function startNewSeason(
  config?: SeasonConfig, 
  createSnapshotFirst?: boolean
): Promise<{ snapshotId?: string }> {
  try {
    console.log('Starting new season...');
    
    let snapshotId: string | undefined;
    
    // Create snapshot if requested
    if (createSnapshotFirst && config) {
      snapshotId = await createSeasonSnapshot(config);
    }
    
    // Reset player data
    const resetConfig: SeasonConfig = config || {
      seasonNumber: await getCurrentSeasonNumber(),
      seasonName: 'New Season',
      startDate: new Date(),
      resetElo: 1200,
      resetTier: PlayerTier.SILVER,
      preservePeakElo: true
    };
    
    await resetSeasonData(resetConfig);
    
    console.log('New season started successfully');
    return { snapshotId };
  } catch (error) {
    console.error('Start new season failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
} 