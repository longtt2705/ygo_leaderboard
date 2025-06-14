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
import { Player, Match, PlayerTier, Local, DeckArchetype } from '@/types';

// Collections
const PLAYERS_COLLECTION = 'players';
const MATCHES_COLLECTION = 'matches';
const LOCALS_COLLECTION = 'locals';
const DECK_ARCHETYPES_COLLECTION = 'deckArchetypes';

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
    
    return querySnapshot.docs.map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      rank: index + 1
    })) as Player[];
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
    
    // Update each player's rank
    const updatePromises = players.map((player, index) => 
      updatePlayer(player.id, { rank: index + 1 })
    );
    
    await Promise.all(updatePromises);
    console.log('Rankings recalculated successfully');
  } catch (error) {
    console.error('Error recalculating rankings:', error);
    throw error;
  }
}

// Sync player stats with actual match history
export async function syncPlayerStats(): Promise<void> {
  try {
    const [players, matches] = await Promise.all([
      getAllPlayers(),
      getAllMatches()
    ]);

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
    console.error('Error syncing player stats:', error);
    throw error;
  }
} 