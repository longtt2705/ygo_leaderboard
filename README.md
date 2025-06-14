# Yu-Gi-Oh! Leaderboard 🃏

A modern, competitive ranking system for local Yu-Gi-Oh! tournaments and matches. Built with Next.js 15, TypeScript, and Tailwind CSS, inspired by popular MOBA game leaderboards.

## ✨ Features

### 🏆 Core Functionality
- **Dynamic Leaderboard**: Real-time player rankings with ELO-based scoring system
- **Player Profiles**: Detailed individual statistics, match history, and deck information
- **Tier System**: 8-tier ranking system from Bronze to Challenger
- **Match History**: Comprehensive tracking of wins, losses, and rating changes
- **Deck Archetypes**: Support for popular Yu-Gi-Oh! deck types

### 🎨 User Interface
- **Modern Dark Theme**: Sleek, gaming-inspired UI design
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Professional Typography**: Clean, readable fonts with proper hierarchy

### 📊 Statistics & Analytics
- **ELO Rating System**: Industry-standard rating calculation
- **Win Rate Tracking**: Visual progress bars and percentage displays
- **Streak Indicators**: Current winning/losing streaks
- **Peak Rating**: Historical highest rating achievement
- **Regional Divisions**: Support for different geographic regions

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **UI Components**: [Radix UI](https://www.radix-ui.com/) for accessible components
- **Icons**: [Lucide React](https://lucide.dev/) for beautiful icons
- **Deployment Ready**: Optimized for Vercel deployment

## 🚀 Getting Started

### Prerequisites
- Node.js 18.16.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd yugioh-leaderboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
npm start
```

## 🎮 Usage

### Main Leaderboard
- View the current #1 ranked player with detailed statistics
- Browse top contenders (ranks 2-5) in an attractive card layout
- Scroll through the full rankings table for all players

### Player Profiles
- Click on any player name or avatar to view their detailed profile
- See comprehensive match history with win/loss records
- Track rating changes over time
- View deck archetype preferences and performance

### Navigation
- Use the navigation buttons to move between views
- All components are fully interactive and responsive

## 📁 Project Structure

```
yugioh-leaderboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── player/[id]/       # Dynamic player profile pages
│   │   ├── globals.css        # Global styles and themes
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Main leaderboard page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (Avatar, etc.)
│   │   ├── TopPlayer.tsx     # Featured #1 player component
│   │   ├── FeaturedPlayers.tsx # Top 4 players grid
│   │   └── LeaderboardTable.tsx # Main rankings table
│   ├── lib/                  # Utility functions and data
│   │   ├── utils.ts          # Helper functions and ELO calculations
│   │   └── mockData.ts       # Sample data for development
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Interface definitions
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🧮 ELO Rating System

The leaderboard uses a sophisticated ELO rating system:

- **K-Factor Calculation**: Dynamic K-factor based on player experience and rating
- **Expected Score**: Mathematical prediction of match outcomes
- **Rating Changes**: Balanced gain/loss system preventing rating inflation
- **Tier Boundaries**: Automatic tier assignment based on rating ranges

### Tier System
- 🥉 **Bronze**: 1000-1199 LP
- 🥈 **Silver**: 1200-1399 LP  
- 🥇 **Gold**: 1400-1599 LP
- 💎 **Platinum**: 1600-1799 LP
- 💠 **Diamond**: 1800-1999 LP
- ⭐ **Master**: 2000-2199 LP
- 🏆 **Grandmaster**: 2200-2399 LP
- 👑 **Challenger**: 2400+ LP

## 🎯 Future Enhancements

- **Database Integration**: Replace mock data with real database
- **User Authentication**: Login system for players
- **Tournament Brackets**: Structured tournament organization
- **Live Match Updates**: Real-time match result reporting
- **Advanced Statistics**: More detailed analytics and charts
- **Mobile App**: Native mobile application
- **API Endpoints**: RESTful API for external integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Bug fixes
- Feature requests
- UI/UX improvements
- Performance optimizations
- Documentation updates

## 📄 License

This project is created for educational and local tournament use. Feel free to fork and modify for your own Yu-Gi-Oh! community.

## 🙏 Acknowledgments

- Inspired by League of Legends and other competitive game leaderboards
- Built with modern web development best practices
- Designed for the Yu-Gi-Oh! trading card game community

---

**Happy Dueling!** 🃏✨
# ygo_leaderboard
