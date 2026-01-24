# Season Management System

The Yu-Gi-Oh! Leaderboard includes a comprehensive season management system that allows administrators to maintain competitive integrity while preserving historical data.

## Overview

The season system enables periodic resets of player rankings while maintaining complete historical records. This is essential for:
- **Competitive Balance**: Prevents rating stagnation and gives new players opportunities
- **Engagement**: Creates regular fresh starts and goals for the community
- **Historical Preservation**: Maintains complete records of past achievements
- **Tournament Cycles**: Aligns with official tournament seasons or local event schedules

## Features

### 🏆 Season Snapshots
- Complete preservation of player rankings, statistics, and match history
- Season champion and top performer records
- Comprehensive leaderboard statistics
- Match data with full game details

### 🔄 Flexible Reset Options
- Configurable ELO reset values (default: 1200)
- Customizable tier assignments (default: Silver)
- Option to preserve peak ELO achievements
- Selective data preservation

### 🛡️ Safety Features
- Interactive confirmation prompts
- Dry-run mode for testing
- Detailed operation logging
- Rollback-friendly data structure

### 📊 Historical Analytics
- Season-over-season comparisons
- Champion hall of fame
- Statistical trends and insights
- Player progression tracking

## Usage Methods

### 1. Command Line Interface (Recommended)

The CLI provides the most control and is perfect for automated deployment scripts:

```bash
# View all available commands
npm run season:help

# Test what would happen (recommended first step)
npm run season:dry-run

# Start a new season with default settings
npm run season:start

# Advanced: Custom season with specific settings
npx tsx scripts/seasonManager.ts start-new-season \
  --season-name "Winter Championship 2024" \
  --reset-elo 1000 \
  --preserve-peak
```

### 2. Web Admin Interface

For non-technical administrators, use the React component in your admin panel:

```tsx
import SeasonManager from '@/components/admin/SeasonManager';

function AdminPanel() {
  return (
    <div>
      <SeasonManager onSeasonChange={() => {
        // Refresh leaderboard data
        window.location.reload();
      }} />
    </div>
  );
}
```

## Command Reference

### Core Commands

| Command | Description | Safety Level |
|---------|-------------|--------------|
| `start-new-season` | Creates snapshot + resets data | ⚠️ High Impact |
| `create-snapshot` | Saves current season only | ✅ Safe |
| `reset-data` | Resets player data only | ⚠️ High Impact |
| `list-seasons` | View season history | ✅ Safe |
| `view-season <id>` | Detailed season view | ✅ Safe |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--season-name` | `Season N` | Custom season display name |
| `--reset-elo` | `1200` | ELO value for player reset |
| `--preserve-peak` | `true` | Keep peak ELO from previous season |
| `--no-snapshot` | `false` | Skip snapshot creation |
| `--dry-run` | `false` | Show preview without changes |

## Best Practices

### 1. Pre-Season Planning

```bash
# 1. Review current season performance
npm run season:list

# 2. Test the transition
npm run season:dry-run

# 3. Announce to community
# (Send notifications, post announcements)

# 4. Execute during low-activity period
npm run season:start
```

### 2. Safety Procedures

- **Always run dry-run first**: Preview changes before execution
- **Backup during peak seasons**: Create snapshots before major tournaments
- **Schedule strategically**: Avoid peak playing hours
- **Communicate early**: Give players advance notice
- **Monitor post-reset**: Check for any data inconsistencies

### 3. Season Naming Conventions

```bash
# Time-based seasons
--season-name "Spring 2024"
--season-name "Q1 2024 Championship"

# Event-based seasons
--season-name "Regional Qualifier Series"
--season-name "Anniversary Tournament"

# Numbered with themes
--season-name "Season 5: Dragons Rising"
--season-name "Season 6: Elemental Masters"
```

## Data Structure

### Season Snapshot Schema

```typescript
interface SeasonSnapshot {
  id: string;
  seasonNumber: number;
  seasonName: string;
  startDate: Date;
  endDate: Date;
  players: Player[];           // Complete player data
  matches: Match[];            // All season matches
  leaderboardStats: {
    totalPlayers: number;
    averageElo: number;
    topPlayerElo: number;
    totalMatches: number;
    mostPlayedDeck: string;
  };
  topPlayer: Player;           // Season champion
  createdAt: Date;
}
```

### Reset Configuration

```typescript
interface SeasonConfig {
  seasonNumber: number;
  seasonName: string;
  startDate: Date;
  endDate?: Date;
  resetElo?: number;           // Default: 1200
  resetTier?: PlayerTier;      // Default: SILVER
  preservePeakElo?: boolean;   // Default: true
}
```

## Example Workflows

### 1. Regular Season Transition

```bash
# Every 3 months, transition to new season
npm run season:start --season-name "Q1 2024"
```

### 2. Tournament Season End

```bash
# End tournament, preserve data, but don't reset yet
npm run season:snapshot --season-name "Regional Championship Finals"

# Later, start new season for casual play
npm run season:reset --reset-elo 1100
```

### 3. Mid-Season Backup

```bash
# Create safety backup during active season
npm run season:snapshot --season-name "Mid-Season Backup - Week 8"
```

### 4. Emergency Reset

```bash
# If data corruption occurs, reset with preserved peaks
npm run season:reset --preserve-peak --reset-elo 1200
```

## Troubleshooting

### Common Issues

**Error: "No players found"**
- Check Firebase connection
- Verify players collection exists
- Run database initialization if needed

**Error: "Permission denied"**
- Verify Firebase admin permissions
- Check authentication credentials
- Ensure proper IAM roles

**Snapshot creation fails**
- Check available storage space
- Verify Firestore write permissions
- Monitor rate limiting

### Recovery Procedures

**Accidental Reset**
```bash
# If you have a recent snapshot, you can restore data
# (This requires manual intervention with Firebase Admin SDK)
# Contact your database administrator
```

**Incomplete Season Transition**
```bash
# Run dry-run to see current state
npm run season:dry-run

# Complete the process if needed
npm run season:start --no-snapshot
```

## Integration Examples

### Automated Deployment

```bash
#!/bin/bash
# deploy-new-season.sh

echo "Starting season deployment..."

# Test the transition
npm run season:dry-run

# Wait for confirmation
read -p "Proceed with season transition? (y/N): " confirm
if [[ $confirm == [yY] ]]; then
    # Execute the transition
    npm run season:start --season-name "Automated Season $(date +%Y-%m)"
    
    # Deploy frontend updates
    npm run build
    npm run deploy
    
    echo "Season deployment completed!"
else
    echo "Season deployment cancelled."
fi
```

### Monitoring Integration

```bash
# Add to your monitoring scripts
npm run season:list | grep -E "Season [0-9]+" | tail -1 > current_season.txt
```

## Support

For additional help or custom requirements:
- Review the script source code in `scripts/seasonManager.ts`
- Check Firebase logs for detailed error messages
- Test changes in a development environment first
- Create database backups before major operations

---

**Remember**: Season management operations can significantly impact your leaderboard. Always test thoroughly and communicate changes to your community in advance. 