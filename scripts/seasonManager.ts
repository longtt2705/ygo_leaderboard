#!/usr/bin/env node

/**
 * Yu-Gi-Oh! Leaderboard Season Manager Script (TypeScript)
 * 
 * This script helps manage seasons by:
 * - Creating snapshots of current season data
 * - Resetting player ELO and statistics
 * - Starting new seasons
 * - Viewing season history
 * 
 * Usage:
 * npx tsx scripts/seasonManager.ts [command] [options]
 * 
 * Commands:
 * - start-new-season: Start a new season (creates snapshot + resets data)
 * - create-snapshot: Only create a snapshot without resetting
 * - reset-data: Only reset player data without creating snapshot
 * - list-seasons: List all past seasons
 * - view-season <seasonId>: View specific season details
 * 
 * Options:
 * --season-name: Custom season name (e.g., "Winter Championship 2024")
 * --no-snapshot: Skip creating snapshot when starting new season
 * --reset-elo: Custom ELO reset value (default: 1200)
 * --preserve-peak: Preserve peak ELO from previous season (default: true)
 * --dry-run: Show what would happen without making changes
 * --mock: Use mock data (for testing without Firebase)
 */

import * as readline from 'readline';
import { PlayerTier, SeasonConfig } from '../src/types';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];
const flags: { [key: string]: any } = {};

// Parse flags
for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
        const flagName = arg.slice(2);
        if (args[i + 1] && !args[i + 1].startsWith('--')) {
            flags[flagName] = args[i + 1];
            i++; // Skip next argument as it's the value
        } else {
            flags[flagName] = true;
        }
    }
}

// Color utilities for better console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
} as const;

function colorLog(color: keyof typeof colors, message: string) {
    console.log(colors[color] + message + colors.reset);
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function confirmAction(message: string): Promise<boolean> {
    const answer = await askQuestion(colors.yellow + message + ' (y/N): ' + colors.reset);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Firebase service with error handling
let firebaseService: any = null;
let isFirebaseAvailable = false;

async function initializeFirebaseService() {
    if (flags['mock']) {
        colorLog('yellow', '🔧 Running in MOCK mode - using test data');
        isFirebaseAvailable = false;
        return;
    }

    try {
        const firebaseModule = await import('../src/lib/firebaseService');
        firebaseService = firebaseModule;
        isFirebaseAvailable = true;
        colorLog('green', '✅ Firebase connection established');
    } catch (error) {
        colorLog('yellow', '⚠️ Firebase not available - running in mock mode');
        colorLog('blue', '   To use Firebase: Set up environment variables or use --mock flag');
        isFirebaseAvailable = false;
    }
}

// Mock service for testing
const mockFirebaseService = {
    async getCurrentSeasonNumber() {
        return 1;
    },

    async getAllPlayers() {
        return [
            { id: '1', name: 'Test Player 1', elo: 1800, wins: 15, losses: 5 },
            { id: '2', name: 'Test Player 2', elo: 1650, wins: 12, losses: 8 }
        ];
    },

    async getAllMatches() {
        return [
            { id: '1', player1Id: '1', player2Id: '2', winnerId: '1', date: new Date() }
        ];
    },

    async startNewSeason(config: SeasonConfig, createSnapshot: boolean) {
        colorLog('green', '✓ [MOCK] Season started successfully!');
        return { snapshotId: 'mock-snapshot-id' };
    },

    async createSeasonSnapshot(config: SeasonConfig) {
        colorLog('green', '✓ [MOCK] Snapshot created successfully!');
        return 'mock-snapshot-id';
    },

    async resetSeasonData(config: SeasonConfig) {
        colorLog('green', '✓ [MOCK] Player data reset successfully!');
    },

    async getAllSeasons() {
        return [
            {
                id: 'season-1',
                seasonNumber: 1,
                seasonName: 'Test Season 1',
                startDate: new Date(2024, 0, 1),
                endDate: new Date(2024, 2, 31),
                topPlayer: { name: 'Champion Player', elo: 2000 },
                leaderboardStats: { totalPlayers: 25, totalMatches: 150 }
            }
        ];
    },

    async getSeason(seasonId: string) {
        return null;
    }
};

function getService() {
    return isFirebaseAvailable ? firebaseService : mockFirebaseService;
}

async function startNewSeasonCommand(): Promise<void> {
    try {
        colorLog('cyan', '\n🏆 Starting New Season Process');
        colorLog('bright', '================================\n');

        const service = getService();
        const currentSeasonNumber = await service.getCurrentSeasonNumber();
        const seasonName = flags['season-name'] || `Season ${currentSeasonNumber}`;
        const createSnapshot = !flags['no-snapshot'];
        const resetElo = parseInt(flags['reset-elo']) || 1200;
        const preservePeak = flags['preserve-peak'] !== false;

        // Show what will happen
        colorLog('blue', 'Season Configuration:');
        console.log(`  • Season Number: ${currentSeasonNumber}`);
        console.log(`  • Season Name: ${seasonName}`);
        console.log(`  • Create Snapshot: ${createSnapshot ? 'Yes' : 'No'}`);
        console.log(`  • Reset ELO: ${resetElo}`);
        console.log(`  • Preserve Peak ELO: ${preservePeak ? 'Yes' : 'No'}`);
        console.log(`  • Mode: ${isFirebaseAvailable ? 'Firebase' : 'Mock'}`);
        console.log();

        if (flags['dry-run']) {
            colorLog('yellow', '🔍 DRY RUN MODE - No changes will be made');
            return;
        }

        // Get current stats
        const [players, matches] = await Promise.all([
            service.getAllPlayers(),
            service.getAllMatches()
        ]);

        console.log(`Current Season Stats:`);
        console.log(`  • Total Players: ${players.length}`);
        console.log(`  • Total Matches: ${matches.length}`);
        console.log();

        // Confirm action
        const confirmed = await confirmAction(
            `⚠️  This will ${createSnapshot ? 'create a snapshot and ' : ''}reset all player data. Continue?`
        );

        if (!confirmed) {
            colorLog('yellow', '❌ Operation cancelled');
            return;
        }

        // Execute season start
        colorLog('blue', '\n🔄 Processing season transition...');

        const seasonConfig: SeasonConfig = {
            seasonNumber: currentSeasonNumber,
            seasonName,
            startDate: new Date(),
            resetElo,
            resetTier: PlayerTier.SILVER,
            preservePeakElo: preservePeak
        };

        const result = await service.startNewSeason(seasonConfig, createSnapshot);

        colorLog('green', '\n🎉 Season transition completed successfully!');
        if (result.snapshotId) {
            console.log(`   Snapshot ID: ${result.snapshotId}`);
        }
        console.log(`   New Season: ${seasonName} (#${currentSeasonNumber})`);
        colorLog('green', '\n✨ Players can now start competing in the new season!');

    } catch (error) {
        colorLog('red', `❌ Error starting new season: ${(error as Error).message}`);
        throw error;
    }
}

async function createSnapshotOnly(): Promise<void> {
    try {
        colorLog('cyan', '\n📸 Creating Season Snapshot');
        colorLog('bright', '===========================\n');

        const service = getService();
        const currentSeasonNumber = await service.getCurrentSeasonNumber();
        const seasonName = flags['season-name'] || `Season ${currentSeasonNumber - 1}`;

        const seasonConfig: SeasonConfig = {
            seasonNumber: currentSeasonNumber - 1,
            seasonName,
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago (estimated)
            endDate: new Date()
        };

        if (flags['dry-run']) {
            colorLog('yellow', '🔍 DRY RUN MODE - Would create snapshot for:');
            console.log(`  • Season: ${seasonName}`);
            console.log(`  • End Date: ${formatDate(new Date())}`);
            console.log(`  • Mode: ${isFirebaseAvailable ? 'Firebase' : 'Mock'}`);
            return;
        }

        const confirmed = await confirmAction('Create season snapshot?');
        if (!confirmed) {
            colorLog('yellow', '❌ Operation cancelled');
            return;
        }

        const snapshotId = await service.createSeasonSnapshot(seasonConfig);
        colorLog('green', `\n✓ Snapshot created successfully! ID: ${snapshotId}`);

    } catch (error) {
        colorLog('red', `❌ Error creating snapshot: ${(error as Error).message}`);
        throw error;
    }
}

async function resetDataOnly(): Promise<void> {
    try {
        colorLog('cyan', '\n🔄 Resetting Player Data');
        colorLog('bright', '========================\n');

        const resetElo = parseInt(flags['reset-elo']) || 1200;
        const preservePeak = flags['preserve-peak'] !== false;

        console.log('Reset Configuration:');
        console.log(`  • Reset ELO: ${resetElo}`);
        console.log(`  • Preserve Peak ELO: ${preservePeak ? 'Yes' : 'No'}`);
        console.log(`  • Mode: ${isFirebaseAvailable ? 'Firebase' : 'Mock'}`);
        console.log();

        if (flags['dry-run']) {
            colorLog('yellow', '🔍 DRY RUN MODE - Would reset all player data');
            return;
        }

        const confirmed = await confirmAction('⚠️  This will reset ALL player statistics. Continue?');
        if (!confirmed) {
            colorLog('yellow', '❌ Operation cancelled');
            return;
        }

        const service = getService();
        const seasonConfig: SeasonConfig = {
            seasonNumber: await service.getCurrentSeasonNumber(),
            seasonName: 'Data Reset',
            startDate: new Date(),
            resetElo,
            resetTier: PlayerTier.SILVER,
            preservePeakElo: preservePeak
        };

        await service.resetSeasonData(seasonConfig);
        colorLog('green', '\n✓ Player data reset completed!');

    } catch (error) {
        colorLog('red', `❌ Error resetting data: ${(error as Error).message}`);
        throw error;
    }
}

async function listSeasonsCommand(): Promise<void> {
    try {
        colorLog('cyan', '\n📋 Season History');
        colorLog('bright', '=================\n');

        const service = getService();
        const seasons = await service.getAllSeasons();

        if (seasons.length === 0) {
            colorLog('yellow', 'No seasons found.');
            return;
        }

        console.log(`Mode: ${isFirebaseAvailable ? 'Firebase' : 'Mock Data'}\n`);

        seasons.forEach((season: any, index: number) => {
            const isLatest = index === 0;
            const prefix = isLatest ? '👑' : '  ';

            console.log(`${prefix} Season ${season.seasonNumber}: ${season.seasonName}`);
            console.log(`     ${formatDate(season.startDate)} - ${formatDate(season.endDate)}`);
            console.log(`     Champion: ${season.topPlayer?.name || 'N/A'} (${season.topPlayer?.elo || 0} ELO)`);
            console.log(`     Players: ${season.leaderboardStats?.totalPlayers || 0} | Matches: ${season.leaderboardStats?.totalMatches || 0}`);
            console.log();
        });

    } catch (error) {
        colorLog('red', `❌ Error listing seasons: ${(error as Error).message}`);
        throw error;
    }
}

async function viewSeasonCommand(): Promise<void> {
    try {
        const seasonId = args[1];
        if (!seasonId) {
            colorLog('red', '❌ Please provide a season ID');
            return;
        }

        colorLog('cyan', `\n🔍 Season Details`);
        colorLog('bright', '=================\n');

        const service = getService();
        const season = await service.getSeason(seasonId);

        if (!season) {
            colorLog('red', `❌ Season not found: ${seasonId}`);
            return;
        }

        console.log(`Season ${season.seasonNumber}: ${season.seasonName}`);
        console.log(`Duration: ${formatDate(season.startDate)} - ${formatDate(season.endDate)}`);
        console.log();

        console.log('🏆 Champion:');
        console.log(`  ${season.topPlayer?.name || 'N/A'} - ${season.topPlayer?.elo || 0} ELO`);
        console.log();

        console.log('📊 Statistics:');
        console.log(`  Players: ${season.leaderboardStats?.totalPlayers || 0}`);
        console.log(`  Matches: ${season.leaderboardStats?.totalMatches || 0}`);
        console.log(`  Average ELO: ${season.leaderboardStats?.averageElo || 0}`);
        console.log(`  Most Played Deck: ${season.leaderboardStats?.mostPlayedDeck || 'N/A'}`);
        console.log();

        if (season.players && season.players.length > 0) {
            console.log('🥇 Top 5 Players:');
            season.players.slice(0, 5).forEach((player: any, index: number) => {
                console.log(`  ${index + 1}. ${player.name} - ${player.elo} ELO (${player.wins}W-${player.losses}L)`);
            });
        }

    } catch (error) {
        colorLog('red', `❌ Error viewing season: ${(error as Error).message}`);
        throw error;
    }
}

function showHelp(): void {
    colorLog('cyan', '\n🃏 Yu-Gi-Oh! Leaderboard Season Manager');
    colorLog('bright', '=====================================\n');

    console.log('Commands:');
    console.log('  start-new-season    Start a new season (create snapshot + reset data)');
    console.log('  create-snapshot     Create a snapshot without resetting data');
    console.log('  reset-data          Reset player data without creating snapshot');
    console.log('  list-seasons        List all past seasons');
    console.log('  view-season <id>    View specific season details');
    console.log('  help               Show this help message');
    console.log();

    console.log('Options:');
    console.log('  --season-name <name>    Custom season name');
    console.log('  --no-snapshot          Skip creating snapshot');
    console.log('  --reset-elo <number>   Custom ELO reset value (default: 1200)');
    console.log('  --preserve-peak        Preserve peak ELO from previous season');
    console.log('  --dry-run              Show what would happen without making changes');
    console.log('  --mock                 Use mock data (for testing without Firebase)');
    console.log();

    console.log('Examples:');
    console.log('  npx tsx scripts/seasonManager.ts start-new-season --season-name "Winter 2024"');
    console.log('  npx tsx scripts/seasonManager.ts create-snapshot --dry-run');
    console.log('  npx tsx scripts/seasonManager.ts reset-data --reset-elo 1000');
    console.log('  npx tsx scripts/seasonManager.ts list-seasons --mock');
    console.log();

    console.log('Firebase Setup:');
    console.log('  Set environment variables: NEXT_PUBLIC_FIREBASE_API_KEY, etc.');
    console.log('  Or use --mock flag to test with sample data');
    console.log();
}

async function main(): Promise<void> {
    try {
        // Initialize Firebase service
        await initializeFirebaseService();

        switch (command) {
            case 'start-new-season':
                await startNewSeasonCommand();
                break;
            case 'create-snapshot':
                await createSnapshotOnly();
                break;
            case 'reset-data':
                await resetDataOnly();
                break;
            case 'list-seasons':
                await listSeasonsCommand();
                break;
            case 'view-season':
                await viewSeasonCommand();
                break;
            case 'help':
            case '--help':
            case '-h':
                showHelp();
                break;
            default:
                if (!command) {
                    showHelp();
                } else {
                    colorLog('red', `❌ Unknown command: ${command}`);
                    showHelp();
                }
                break;
        }
    } catch (error) {
        colorLog('red', `\n💥 Fatal error: ${(error as Error).message}`);
        if (!isFirebaseAvailable) {
            colorLog('blue', '\n💡 Tip: Try using --mock flag for testing without Firebase');
        }
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Handle script interruption
process.on('SIGINT', () => {
    colorLog('yellow', '\n\n⏹️  Operation interrupted by user');
    rl.close();
    process.exit(0);
});

// Run the script
main(); 