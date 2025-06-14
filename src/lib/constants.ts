// Boss Monster Images for Deck Archetypes
export const BOSS_MONSTER_IMAGES: Record<string, string> = {
  'Blue-Eyes White Dragon': 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
  'Dark Magician': 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
  'Red-Eyes Black Dragon': 'https://images.ygoprodeck.com/images/cards/74677422.jpg',
  'Elemental HERO': 'https://images.ygoprodeck.com/images/cards/58932615.jpg',
  'Cyber Dragon': 'https://images.ygoprodeck.com/images/cards/70095154.jpg',
  'Blackwing': 'https://images.ygoprodeck.com/images/cards/9012916.jpg',
  'Six Samurai': 'https://images.ygoprodeck.com/images/cards/29981921.jpg',
  'Lightsworn': 'https://images.ygoprodeck.com/images/cards/22624373.jpg',
  'Zombie': 'https://images.ygoprodeck.com/images/cards/83764718.jpg',
  'Dragon': 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
  'Spellcaster': 'https://images.ygoprodeck.com/images/cards/46986414.jpg',
  'Warrior': 'https://images.ygoprodeck.com/images/cards/58932615.jpg',
  'Machine': 'https://images.ygoprodeck.com/images/cards/70095154.jpg',
  'Fiend': 'https://images.ygoprodeck.com/images/cards/74677422.jpg',
  'Salamangreat': 'https://images.ygoprodeck.com/images/cards/26889158.jpg',
  'Sky Striker': 'https://images.ygoprodeck.com/images/cards/63288573.jpg',
  'Tearlaments': 'https://images.ygoprodeck.com/images/cards/572850.jpg',
  'Spright': 'https://images.ygoprodeck.com/images/cards/572850.jpg',
  'Live Twin': 'https://images.ygoprodeck.com/images/cards/26889158.jpg',
  'Drytron': 'https://images.ygoprodeck.com/images/cards/69815951.jpg',
  'White Forest': 'https://images.ygoprodeck.com/images/cards/14307929.jpg',
  'Yubel': 'https://images.ygoprodeck.com/images/cards/80453041.jpg',
  'Labrynth': 'https://images.ygoprodeck.com/images/cards/2347656.jpg',
  'Orcust': 'https://images.ygoprodeck.com/images/cards/93854893.jpg',
  'Mikanko': 'https://images.ygoprodeck.com/images/cards/81260679.jpg',
  'Ghoti': 'https://images.ygoprodeck.com/images/cards/72309040.jpg',
  'Goblin Biker': 'https://images.ygoprodeck.com/images/cards/72409226.jpg'
};

// Default boss monster image (Blue-Eyes White Dragon)
export const DEFAULT_BOSS_MONSTER_IMAGE = 'https://images.ygoprodeck.com/images/cards/89631139.jpg';

// Helper function to get boss monster image for a deck
export function getBossMonsterImage(deckName: string): string {
  return BOSS_MONSTER_IMAGES[deckName] || DEFAULT_BOSS_MONSTER_IMAGE;
} 