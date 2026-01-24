#!/usr/bin/env node

/**
 * Yu-Gi-Oh! Leaderboard Season Manager Script
 * 
 * This script helps manage seasons by:
 * - Creating snapshots of current season data
 * - Resetting player ELO and statistics
 * - Starting new seasons
 * - Viewing season history
 * 
 * Usage:
 * node scripts/seasonManager.js [command] [options]
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
 */

const readline = require('readline');

// Since this is a Node.js script, we need to handle Firebase setup differently
// This script should be run from the project root where Firebase is configured

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Command line argument parsing
const args = process.argv.slice(2);
const command = args[0];
const flags = {};

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
};

function colorLog(color, message) {
  console.log(colors[color] + message + colors.reset);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function confirmAction(message) {
  const answer = await askQuestion(colors.yellow + message + ' (y/N): ' + colors.reset);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Mock Firebase functions for the script (in production, these would import from the actual Firebase service)
// These would need to be replaced with actual imports when integrated
const mockFirebaseService = {
  async getCurrentSeasonNumber() {
    return 1; // This would be replaced with actual Firebase call
  },
  
  async getAllPlayers() {
    return []; // This would be replaced with actual Firebase call
  },
  
  async getAllMatches() {
    return []; // This would be replaced with actual Firebase call
  },
  
  async startNewSeason(config, createSnapshot) {
    colorLog('green', '✓ Season started successfully!');
    return { snapshotId: 'mock-snapshot-id' };
  },
  
  async createSeasonSnapshot(config) {
    colorLog('green', '✓ Snapshot created successfully!');
    return 'mock-snapshot-id';
  },
  
  async resetSeasonData(config) {
    colorLog('green', '✓ Player data reset successfully!');
  },
  
  async getAllSeasons() {
    return []; // This would be replaced with actual Firebase call
  },
  
  async getSeason(seasonId) {
    return null; // This would be replaced with actual Firebase call
  }
};

async function startNewSeason() {
  try {
    colorLog('cyan', '\n🏆 Starting New Season Process');
    colorLog('bright', '================================\n');

    const currentSeasonNumber = await mockFirebaseService.getCurrentSeasonNumber();
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
    console.log();

    if (flags['dry-run']) {
      colorLog('yellow', '🔍 DRY RUN MODE - No changes will be made');
      return;
    }

    // Get current stats
    const [players, matches] = await Promise.all([
      mockFirebaseService.getAllPlayers(),
      mockFirebaseService.getAllMatches()
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
    
    const seasonConfig = {
      seasonNumber: currentSeasonNumber,
      seasonName,
      startDate: new Date(),
      resetElo,
      resetTier: 'silver', // This would use the actual PlayerTier enum
      preservePeakElo: preservePeak
    };

    const result = await mockFirebaseService.startNewSeason(seasonConfig, createSnapshot);

    colorLog('green', '\n🎉 Season transition completed successfully!');
    if (result.snapshotId) {
      console.log(`   Snapshot ID: ${result.snapshotId}`);
    }
    console.log(`   New Season: ${seasonName} (#${currentSeasonNumber})`);
    colorLog('green', '\n✨ Players can now start competing in the new season!');

  } catch (error) {
    colorLog('red', `❌ Error starting new season: ${error.message}`);
    throw error;
  }
}

async function createSnapshotOnly() {
  try {
    colorLog('cyan', '\n📸 Creating Season Snapshot');
    colorLog('bright', '===========================\n');

    const currentSeasonNumber = await mockFirebaseService.getCurrentSeasonNumber();
    const seasonName = flags['season-name'] || `Season ${currentSeasonNumber - 1}`;

    const seasonConfig = {
      seasonNumber: currentSeasonNumber - 1,
      seasonName,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago (estimated)
      endDate: new Date()
    };

    if (flags['dry-run']) {
      colorLog('yellow', '🔍 DRY RUN MODE - Would create snapshot for:');
      console.log(`  • Season: ${seasonName}`);
      console.log(`  • End Date: ${formatDate(new Date())}`);
      return;
    }

    const confirmed = await confirmAction('Create season snapshot?');
    if (!confirmed) {
      colorLog('yellow', '❌ Operation cancelled');
      return;
    }

    const snapshotId = await mockFirebaseService.createSeasonSnapshot(seasonConfig);
    colorLog('green', `\n✓ Snapshot created successfully! ID: ${snapshotId}`);

  } catch (error) {
    colorLog('red', `❌ Error creating snapshot: ${error.message}`);
    throw error;
  }
}

async function resetDataOnly() {
  try {
    colorLog('cyan', '\n🔄 Resetting Player Data');
    colorLog('bright', '========================\n');

    const resetElo = parseInt(flags['reset-elo']) || 1200;
    const preservePeak = flags['preserve-peak'] !== false;

    console.log('Reset Configuration:');
    console.log(`  • Reset ELO: ${resetElo}`);
    console.log(`  • Preserve Peak ELO: ${preservePeak ? 'Yes' : 'No'}`);
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

    const seasonConfig = {
      seasonNumber: await mockFirebaseService.getCurrentSeasonNumber(),
      seasonName: 'Data Reset',
      startDate: new Date(),
      resetElo,
      resetTier: 'silver',
      preservePeakElo: preservePeak
    };

    await mockFirebaseService.resetSeasonData(seasonConfig);
    colorLog('green', '\n✓ Player data reset completed!');

  } catch (error) {
    colorLog('red', `❌ Error resetting data: ${error.message}`);
    throw error;
  }
}

async function listSeasons() {
  try {
    colorLog('cyan', '\n📋 Season History');
    colorLog('bright', '=================\n');

    const seasons = await mockFirebaseService.getAllSeasons();
    
    if (seasons.length === 0) {
      colorLog('yellow', 'No seasons found.');
      return;
    }

    seasons.forEach((season, index) => {
      const isLatest = index === 0;
      const prefix = isLatest ? '👑' : '  ';
      
      console.log(`${prefix} Season ${season.seasonNumber}: ${season.seasonName}`);
      console.log(`     ${formatDate(season.startDate)} - ${formatDate(season.endDate)}`);
      console.log(`     Champion: ${season.topPlayer.name} (${season.topPlayer.elo} ELO)`);
      console.log(`     Players: ${season.leaderboardStats.totalPlayers} | Matches: ${season.leaderboardStats.totalMatches}`);
      console.log();
    });

  } catch (error) {
    colorLog('red', `❌ Error listing seasons: ${error.message}`);
    throw error;
  }
}

async function viewSeason() {
  try {
    const seasonId = args[1];
    if (!seasonId) {
      colorLog('red', '❌ Please provide a season ID');
      return;
    }

    colorLog('cyan', `\n🔍 Season Details`);
    colorLog('bright', '=================\n');

    const season = await mockFirebaseService.getSeason(seasonId);
    
    if (!season) {
      colorLog('red', `❌ Season not found: ${seasonId}`);
      return;
    }

    console.log(`Season ${season.seasonNumber}: ${season.seasonName}`);
    console.log(`Duration: ${formatDate(season.startDate)} - ${formatDate(season.endDate)}`);
    console.log();
    
    console.log('🏆 Champion:');
    console.log(`  ${season.topPlayer.name} - ${season.topPlayer.elo} ELO`);
    console.log();
    
    console.log('📊 Statistics:');
    console.log(`  Players: ${season.leaderboardStats.totalPlayers}`);
    console.log(`  Matches: ${season.leaderboardStats.totalMatches}`);
    console.log(`  Average ELO: ${season.leaderboardStats.averageElo}`);
    console.log(`  Most Played Deck: ${season.leaderboardStats.mostPlayedDeck}`);
    console.log();
    
    console.log('🥇 Top 5 Players:');
    season.players.slice(0, 5).forEach((player, index) => {
      console.log(`  ${index + 1}. ${player.name} - ${player.elo} ELO (${player.wins}W-${player.losses}L)`);
    });

  } catch (error) {
    colorLog('red', `❌ Error viewing season: ${error.message}`);
    throw error;
  }
}

function showHelp() {
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
  console.log();

  console.log('Examples:');
  console.log('  node scripts/seasonManager.js start-new-season --season-name "Winter 2024"');
  console.log('  node scripts/seasonManager.js create-snapshot --dry-run');
  console.log('  node scripts/seasonManager.js reset-data --reset-elo 1000');
  console.log('  node scripts/seasonManager.js list-seasons');
  console.log();
}

async function main() {
  try {
    switch (command) {
      case 'start-new-season':
        await startNewSeason();
        break;
      case 'create-snapshot':
        await createSnapshotOnly();
        break;
      case 'reset-data':
        await resetDataOnly();
        break;
      case 'list-seasons':
        await listSeasons();
        break;
      case 'view-season':
        await viewSeason();
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
    colorLog('red', `\n💥 Fatal error: ${error.message}`);
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