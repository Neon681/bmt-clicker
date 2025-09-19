// Enhanced OSRS Clicker Heroes Game
class Game {
    constructor() {
        // Check if we're in reset mode
        const urlParams = new URLSearchParams(window.location.search);
        const isReset = urlParams.get('reset') || urlParams.get('forceReset');
        
        this.gold = 0;
        this.clickDamage = 1;
        this.dps = 0;
        this.monstersKilled = 0;
        this.zone = 1;
        this.currentMonster = null;
        this.heroSouls = 0;
        this.totalHeroSouls = 0;
        this.prestigePoints = 0;
        this.totalPrestigePoints = 0;
        this.heroes = [];
        this.upgrades = [];
        this.achievements = [];
        this.prestigeUpgrades = [];
        this.lastSave = Date.now();
        this.skipLoad = isReset; // Skip loading if we're resetting
        this.gameStartTime = Date.now();
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            particlesEnabled: true,
            damageNumbersEnabled: true
        };
        this.statistics = {
            totalClicks: 0,
            totalDamageDealt: 0,
            totalGoldEarned: 0,
            totalTimePlayed: 0,
            highestZone: 1,
            totalAscensions: 0,
            treasureChestsFound: 0,
            treasureGoldEarned: 0,
            totalPlayTime: 0,
            averageGoldPerHour: 0,
            averageDPS: 0,
            fastestZoneTime: 0,
            totalPrestigeGained: 0
        };
        this.criticalHitChance = 0.05; // 5% base crit chance
        this.criticalHitMultiplier = 2;
        this.comboMultiplier = 1;
        this.comboCount = 0;
        this.lastClickTime = 0;
        this.treasureChestActive = false;
        this.treasureChestChance = 0.05; // 5% chance per monster kill
        this.activeSkills = [];
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        this.inventory = [];
        this.dailyChallenges = [];
        this.lastChallengeReset = Date.now();
        this.skillEffects = {
            goldenTouch: { active: false, endTime: 0 },
            berserkerMode: { active: false, endTime: 0 },
            luckyStrike: { active: false, endTime: 0 },
            timeWarp: { active: false, endTime: 0 },
            heroRally: { active: false, endTime: 0 }
        };
        
        this.showLoadingScreen();
        this.initializeGame();
    }
    
    showLoadingScreen() {
        // Hide loading screen after 2 seconds
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);
    }
    
    initializeGame() {
        this.initializeZones();
        this.initializeHeroes();
        this.initializeUpgrades();
        this.initializeAchievements();
        this.initializePrestigeUpgrades();
        this.initializeActiveSkills();
        this.initializeEquipment();
        this.initializeDailyChallenges();
        
        // Only load game if we're not resetting
        if (!this.skipLoad) {
            this.loadGame();
        } else {
            console.log('Skipping load due to reset flag');
            // Clear the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        this.spawnMonster();
        this.updateDisplay();
        this.startGameLoop();
        this.bindEvents();
    }
    
    bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if typing in an input
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.attackMonster();
                    break;
                case 'KeyS':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.saveGame();
                    }
                    break;
                case 'KeyQ':
                    e.preventDefault();
                    this.useSkill('goldenTouch');
                    break;
                case 'KeyW':
                    e.preventDefault();
                    this.useSkill('berserkerMode');
                    break;
                case 'KeyE':
                    e.preventDefault();
                    this.useSkill('luckyStrike');
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.useSkill('heroRally');
                    break;
                case 'KeyT':
                    e.preventDefault();
                    this.useSkill('timeWarp');
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.upgradeHeroMax(0); // Max upgrade first hero
                    break;
                case 'KeyH':
                    e.preventDefault();
                    this.autoHireCheapestHero();
                    break;
                case 'KeyU':
                    e.preventDefault();
                    this.autoUpgradeCheapestUpgrade();
                    break;
            }
        });
        
        // Tab switching functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Click effects on monster
        const monsterImage = document.querySelector('.monster-image');
        if (monsterImage) {
            monsterImage.addEventListener('click', () => {
                this.attackMonster();
            });
        }
    }
    
    switchTab(tabId) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }
    
    initializeZones() {
        this.zones = [
            { name: "Lumbridge", monsters: [
                { name: "Goblin", emoji: "👹", boss: "Goblin Champion" },
                { name: "Cow", emoji: "🐄", boss: "Cow King" },
                { name: "Chicken", emoji: "🐔", boss: "Giant Chicken" },
                { name: "Giant Rat", emoji: "🐀", boss: "Rat King" },
                { name: "Man", emoji: "👨", boss: "Lumbridge Guard Captain" }
            ]},
            { name: "Al Kharid", monsters: [
                { name: "Scorpion", emoji: "🦂", boss: "Desert Scorpion King" },
                { name: "Jackal", emoji: "🐺", boss: "Alpha Jackal" },
                { name: "Vulture", emoji: "🦅", boss: "Giant Vulture" },
                { name: "Camel", emoji: "🐪", boss: "Desert Camel Lord" },
                { name: "Desert Wolf", emoji: "🐺", boss: "Desert Wolf Alpha" }
            ]},
            { name: "Varrock", monsters: [
                { name: "Guard", emoji: "🛡️", boss: "Guard Captain" },
                { name: "Dark Wizard", emoji: "🧙‍♂️", boss: "Archmage Sedridor" },
                { name: "Mugger", emoji: "🗡️", boss: "Thief Leader" },
                { name: "Thief", emoji: "🥷", boss: "Master Thief" },
                { name: "Barbarian", emoji: "⚔️", boss: "Barbarian Chief" }
            ]},
            { name: "Falador", monsters: [
                { name: "White Knight", emoji: "⚔️", boss: "Sir Amik Varze" },
                { name: "Dwarf", emoji: "🧔", boss: "Dwarf King" },
                { name: "Ice Warrior", emoji: "❄️", boss: "Ice Lord" },
                { name: "Ice Giant", emoji: "🧊", boss: "Frost Giant King" },
                { name: "Skeleton", emoji: "💀", boss: "Skeleton Champion" }
            ]},
            { name: "Draynor", monsters: [
                { name: "Vampire", emoji: "🧛", boss: "Count Draynor" },
                { name: "Zombie", emoji: "🧟", boss: "Zombie Champion" },
                { name: "Ghost", emoji: "👻", boss: "Ancient Spirit" },
                { name: "Draynor Guard", emoji: "🛡️", boss: "Captain Rovin" },
                { name: "Tree Spirit", emoji: "🌳", boss: "Elder Tree Spirit" }
            ]},
            { name: "Wilderness", monsters: [
                { name: "Bandit", emoji: "🏴‍☠️", boss: "Bandit Leader" },
                { name: "Chaos Elemental", emoji: "⚡", boss: "Greater Chaos Elemental" },
                { name: "Green Dragon", emoji: "🐲", boss: "Ancient Green Dragon" },
                { name: "Lava Dragon", emoji: "🔥", boss: "Lava Dragon King" },
                { name: "Revenant", emoji: "👻", boss: "Revenant Dragon" }
            ]},
            { name: "God Wars", monsters: [
                { name: "Goblin", emoji: "👹", boss: "General Graardor" },
                { name: "Aviansie", emoji: "🦅", boss: "Kree'arra" },
                { name: "Bloodveld", emoji: "🩸", boss: "K'ril Tsutsaroth" },
                { name: "Ice Troll", emoji: "🧊", boss: "Commander Zilyana" },
                { name: "Demon", emoji: "😈", boss: "Nex" }
            ]},
            { name: "Dragon Realm", monsters: [
                { name: "Baby Dragon", emoji: "🐉", boss: "Ancient Dragon" },
                { name: "Wyvern", emoji: "🐲", boss: "Skeletal Wyvern" },
                { name: "Drake", emoji: "🔥", boss: "Fire Drake Lord" },
                { name: "Wyrm", emoji: "⚡", boss: "Lightning Wyrm" },
                { name: "Elder Dragon", emoji: "🌟", boss: "Dragon King" }
            ]},
            { name: "Shadow Realm", monsters: [
                { name: "Shadow", emoji: "👤", boss: "Shadow Lord" },
                { name: "Wraith", emoji: "👻", boss: "Wraith King" },
                { name: "Specter", emoji: "🌫️", boss: "Ancient Specter" },
                { name: "Phantom", emoji: "😱", boss: "Phantom Emperor" },
                { name: "Void Being", emoji: "🕳️", boss: "Void Overlord" }
            ]}
        ];
    }
    
    initializeHeroes() {
        this.heroTemplates = [
            { name: "Hans", emoji: "👨‍🌾", baseCost: 10, baseDps: 0.5, costMultiplier: 1.07, description: "A helpful gardener from Lumbridge" },
            { name: "Bob the Cat", emoji: "🐱", baseCost: 50, baseDps: 2, costMultiplier: 1.07, description: "Lumbridge's famous feline" },
            { name: "Lumbridge Guide", emoji: "🧑‍🏫", baseCost: 250, baseDps: 8, costMultiplier: 1.07, description: "Teaches new adventurers" },
            { name: "Duke Horacio", emoji: "👑", baseCost: 1500, baseDps: 47, costMultiplier: 1.07, description: "Ruler of Lumbridge" },
            { name: "Doric", emoji: "⚒️", baseCost: 8000, baseDps: 246, costMultiplier: 1.07, description: "Master dwarf smith" },
            { name: "Aubury", emoji: "🔮", baseCost: 50000, baseDps: 1286, costMultiplier: 1.07, description: "Varrock's rune shop owner" },
            { name: "Wizard Mizgog", emoji: "🧙‍♂️", baseCost: 300000, baseDps: 7700, costMultiplier: 1.07, description: "Powerful Wizard's Tower mage" },
            { name: "Father Aereck", emoji: "⛪", baseCost: 2000000, baseDps: 44000, costMultiplier: 1.07, description: "Lumbridge church priest" },
            { name: "Gypsy Aris", emoji: "🔮", baseCost: 15000000, baseDps: 260000, costMultiplier: 1.07, description: "Fortune teller extraordinaire" },
            { name: "Count Draynor", emoji: "🧛", baseCost: 100000000, baseDps: 1500000, costMultiplier: 1.07, description: "Powerful vampire lord" },
            { name: "King Roald", emoji: "👑", baseCost: 750000000, baseDps: 8800000, costMultiplier: 1.07, description: "King of Misthalin" },
            { name: "Vannaka", emoji: "⚔️", baseCost: 5000000000, baseDps: 52000000, costMultiplier: 1.07, description: "Slayer master" },
            { name: "Duradel", emoji: "🗡️", baseCost: 35000000000, baseDps: 300000000, costMultiplier: 1.07, description: "Elite slayer master" },
            { name: "Nieve", emoji: "🏹", baseCost: 250000000000, baseDps: 1800000000, costMultiplier: 1.07, description: "Gnome slayer master" },
            { name: "Wise Old Man", emoji: "🧙‍♂️", baseCost: 2000000000000, baseDps: 10000000000, costMultiplier: 1.07, description: "Ancient and powerful sage" }
        ];
        
        this.heroes = this.heroTemplates.map(template => ({
            ...template,
            level: 0,
            owned: false,
            currentCost: template.baseCost
        }));
    }
    
    initializeUpgrades() {
        this.upgradeTemplates = [
            { id: 'click_damage_1', name: 'Sharp Sword', icon: '⚔️', cost: 50, effect: 'clickDamage', value: 1, description: '+1 Click Damage' },
            { id: 'click_damage_2', name: 'Steel Sword', icon: '🗡️', cost: 500, effect: 'clickDamage', value: 3, description: '+3 Click Damage' },
            { id: 'click_damage_3', name: 'Mithril Sword', icon: '⚔️', cost: 2500, effect: 'clickDamage', value: 8, description: '+8 Click Damage' },
            { id: 'click_damage_4', name: 'Adamant Sword', icon: '🗡️', cost: 15000, effect: 'clickDamage', value: 20, description: '+20 Click Damage' },
            { id: 'click_damage_5', name: 'Rune Sword', icon: '⚔️', cost: 100000, effect: 'clickDamage', value: 50, description: '+50 Click Damage' },
            { id: 'crit_chance_1', name: 'Lucky Charm', icon: '🍀', cost: 1000, effect: 'critChance', value: 0.05, description: '+5% Critical Hit Chance' },
            { id: 'crit_chance_2', name: 'Lucky Ring', icon: '💍', cost: 10000, effect: 'critChance', value: 0.05, description: '+5% Critical Hit Chance' },
            { id: 'crit_damage_1', name: 'Berserker Ring', icon: '💍', cost: 5000, effect: 'critMultiplier', value: 0.5, description: '+50% Critical Hit Damage' },
            { id: 'auto_clicker_1', name: 'Auto Clicker', icon: '🤖', cost: 25000, effect: 'autoClick', value: 1, description: 'Auto-clicks once per second' },
            { id: 'gold_bonus_1', name: 'Gold Ring', icon: '💍', cost: 3000, effect: 'goldBonus', value: 0.25, description: '+25% Gold from monsters' },
            { id: 'gold_bonus_2', name: 'Wealth Amulet', icon: '📿', cost: 20000, effect: 'goldBonus', value: 0.5, description: '+50% Gold from monsters' },
            { id: 'hero_dps_1', name: 'Leadership', icon: '👑', cost: 50000, effect: 'heroDpsBonus', value: 0.5, description: '+50% Hero DPS' },
            { id: 'hero_dps_2', name: 'Command', icon: '⚔️', cost: 250000, effect: 'heroDpsBonus', value: 1.0, description: '+100% Hero DPS' },
        ];
        
        this.upgrades = this.upgradeTemplates.map(template => ({
            ...template,
            purchased: false
        }));
    }
    
    initializeAchievements() {
        this.achievementTemplates = [
            { id: 'first_kill', name: 'First Blood', icon: '⚔️', description: 'Kill your first monster', condition: () => this.monstersKilled >= 1 },
            { id: 'zone_5', name: 'Explorer', icon: '🗺️', description: 'Reach Zone 5', condition: () => this.zone >= 5 },
            { id: 'zone_10', name: 'Adventurer', icon: '🎒', description: 'Reach Zone 10', condition: () => this.zone >= 10 },
            { id: 'first_hero', name: 'Team Player', icon: '👥', description: 'Hire your first hero', condition: () => this.heroes.some(h => h.owned) },
            { id: 'gold_1k', name: 'Wealthy', icon: '💰', description: 'Earn 1,000 gold', condition: () => this.statistics.totalGoldEarned >= 1000 },
            { id: 'gold_1m', name: 'Millionaire', icon: '💎', description: 'Earn 1,000,000 gold', condition: () => this.statistics.totalGoldEarned >= 1000000 },
            { id: 'clicks_100', name: 'Clicker', icon: '👆', description: 'Click 100 times', condition: () => this.statistics.totalClicks >= 100 },
            { id: 'clicks_1000', name: 'Click Master', icon: '🖱️', description: 'Click 1,000 times', condition: () => this.statistics.totalClicks >= 1000 },
            { id: 'first_ascend', name: 'Ascended', icon: '🌟', description: 'Perform your first ascension', condition: () => this.statistics.totalAscensions >= 1 },
            { id: 'zone_50', name: 'Veteran', icon: '🛡️', description: 'Reach Zone 50', condition: () => this.zone >= 50 },
            { id: 'zone_100', name: 'Champion', icon: '🏆', description: 'Reach Zone 100', condition: () => this.zone >= 100 },
            { id: 'all_heroes', name: 'Collector', icon: '👑', description: 'Hire all heroes', condition: () => this.heroes.every(h => h.owned) },
            { id: 'damage_1m', name: 'Destroyer', icon: '💥', description: 'Deal 1,000,000 total damage', condition: () => this.statistics.totalDamageDealt >= 1000000 },
            { id: 'monsters_1k', name: 'Monster Slayer', icon: '⚔️', description: 'Kill 1,000 monsters', condition: () => this.monstersKilled >= 1000 },
            { id: 'souls_100', name: 'Soul Collector', icon: '👻', description: 'Collect 100 Hero Souls', condition: () => this.totalHeroSouls >= 100 },
            { id: 'first_treasure', name: 'Treasure Hunter', icon: '📦', description: 'Find your first treasure chest', condition: () => this.statistics.treasureChestsFound >= 1 },
            { id: 'treasure_10', name: 'Lucky Explorer', icon: '💎', description: 'Find 10 treasure chests', condition: () => this.statistics.treasureChestsFound >= 10 },
            { id: 'treasure_gold_1m', name: 'Treasure Master', icon: '💰', description: 'Earn 1M gold from treasures', condition: () => this.statistics.treasureGoldEarned >= 1000000 },
        ];
        
        this.achievements = this.achievementTemplates.map(template => ({
            ...template,
            unlocked: false,
            dateUnlocked: null
        }));
    }
    
    initializePrestigeUpgrades() {
        this.prestigeUpgradeTemplates = [
            { id: 'click_power', name: 'Enhanced Clicking', icon: '👆', cost: 5, maxLevel: 10, effect: 'clickDamage', value: 2, description: '+2 base click damage per level' },
            { id: 'gold_fortune', name: 'Golden Fortune', icon: '💰', cost: 8, maxLevel: 5, effect: 'goldMultiplier', value: 0.25, description: '+25% gold from all sources per level' },
            { id: 'hero_efficiency', name: 'Hero Mastery', icon: '👑', cost: 12, maxLevel: 8, effect: 'heroDpsBonus', value: 0.5, description: '+50% hero DPS per level' },
            { id: 'treasure_hunter', name: 'Treasure Sense', icon: '🔍', cost: 15, maxLevel: 3, effect: 'treasureChance', value: 0.02, description: '+2% treasure chest spawn chance per level' },
            { id: 'crit_master', name: 'Critical Mastery', icon: '⚡', cost: 10, maxLevel: 5, effect: 'critChance', value: 0.05, description: '+5% critical hit chance per level' },
            { id: 'soul_magnet', name: 'Soul Magnet', icon: '👻', cost: 20, maxLevel: 3, effect: 'soulBonus', value: 0.5, description: '+50% hero souls from ascension per level' },
        ];
        
        this.prestigeUpgrades = this.prestigeUpgradeTemplates.map(template => ({
            ...template,
            level: 0
        }));
    }
    
    initializeActiveSkills() {
        this.activeSkillTemplates = [
            { 
                id: 'goldenTouch', 
                name: 'Golden Touch', 
                icon: '💰', 
                duration: 30000, // 30 seconds
                cooldown: 300000, // 5 minutes
                description: '3x gold for 30 seconds',
                unlockZone: 1
            },
            { 
                id: 'berserkerMode', 
                name: 'Berserker Mode', 
                icon: '⚔️', 
                duration: 15000, // 15 seconds
                cooldown: 180000, // 3 minutes
                description: '3x click damage for 15 seconds',
                unlockZone: 5
            },
            { 
                id: 'luckyStrike', 
                name: 'Lucky Strike', 
                icon: '🍀', 
                duration: 20000, // 20 seconds
                cooldown: 240000, // 4 minutes
                description: '100% crit chance for 20 seconds',
                unlockZone: 10
            },
            { 
                id: 'timeWarp', 
                name: 'Time Warp', 
                icon: '⏰', 
                duration: 60000, // 60 seconds
                cooldown: 600000, // 10 minutes
                description: '2x game speed for 60 seconds',
                unlockZone: 25
            },
            { 
                id: 'heroRally', 
                name: 'Hero Rally', 
                icon: '👑', 
                duration: 45000, // 45 seconds
                cooldown: 480000, // 8 minutes
                description: '3x hero DPS for 45 seconds',
                unlockZone: 15
            }
        ];
        
        this.activeSkills = this.activeSkillTemplates.map(template => ({
            ...template,
            lastUsed: 0,
            timesUsed: 0
        }));
    }
    
    initializeEquipment() {
        this.equipmentTemplates = [
            // Weapons
            { id: 'iron_sword', name: 'Iron Sword', type: 'weapon', rarity: 'common', icon: '⚔️', 
              stats: { clickDamage: 2 }, description: '+2 Click Damage' },
            { id: 'steel_blade', name: 'Steel Blade', type: 'weapon', rarity: 'uncommon', icon: '🗡️', 
              stats: { clickDamage: 5, critChance: 0.02 }, description: '+5 Click Damage, +2% Crit' },
            { id: 'enchanted_sword', name: 'Enchanted Sword', type: 'weapon', rarity: 'rare', icon: '✨', 
              stats: { clickDamage: 12, critChance: 0.05, critMultiplier: 0.5 }, description: '+12 Click Damage, +5% Crit, +50% Crit Damage' },
            { id: 'legendary_blade', name: 'Legendary Blade', type: 'weapon', rarity: 'legendary', icon: '🌟', 
              stats: { clickDamage: 30, critChance: 0.1, critMultiplier: 1.0 }, description: '+30 Click Damage, +10% Crit, +100% Crit Damage' },
            
            // Armor
            { id: 'leather_armor', name: 'Leather Armor', type: 'armor', rarity: 'common', icon: '🛡️', 
              stats: { goldBonus: 0.1 }, description: '+10% Gold from monsters' },
            { id: 'chain_mail', name: 'Chain Mail', type: 'armor', rarity: 'uncommon', icon: '⚔️', 
              stats: { goldBonus: 0.25, heroDpsBonus: 0.2 }, description: '+25% Gold, +20% Hero DPS' },
            { id: 'plate_armor', name: 'Plate Armor', type: 'armor', rarity: 'rare', icon: '🛡️', 
              stats: { goldBonus: 0.5, heroDpsBonus: 0.5 }, description: '+50% Gold, +50% Hero DPS' },
            
            // Accessories  
            { id: 'lucky_ring', name: 'Lucky Ring', type: 'accessory', rarity: 'uncommon', icon: '💍', 
              stats: { treasureChance: 0.02 }, description: '+2% Treasure Chance' },
            { id: 'power_amulet', name: 'Power Amulet', type: 'accessory', rarity: 'rare', icon: '📿', 
              stats: { clickDamage: 8, heroDpsBonus: 0.3 }, description: '+8 Click Damage, +30% Hero DPS' },
            { id: 'soul_crystal', name: 'Soul Crystal', type: 'accessory', rarity: 'legendary', icon: '💎', 
              stats: { clickDamage: 20, goldBonus: 0.75, treasureChance: 0.05 }, description: '+20 Click Damage, +75% Gold, +5% Treasure Chance' }
        ];
    }
    
    initializeDailyChallenges() {
        this.generateDailyChallenges();
    }
    
    generateDailyChallenges() {
        const challengeTemplates = [
            { id: 'click_challenge', name: 'Click Master', icon: '👆', target: 500, type: 'clicks', reward: { gold: 5000 }, description: 'Click 500 times' },
            { id: 'monster_challenge', name: 'Monster Hunter', icon: '⚔️', target: 50, type: 'monsters', reward: { gold: 10000 }, description: 'Kill 50 monsters' },
            { id: 'gold_challenge', name: 'Gold Digger', icon: '💰', target: 25000, type: 'gold', reward: { prestigePoints: 1 }, description: 'Earn 25,000 gold' },
            { id: 'treasure_challenge', name: 'Treasure Seeker', icon: '📦', target: 3, type: 'treasures', reward: { gold: 15000, prestigePoints: 1 }, description: 'Find 3 treasure chests' },
            { id: 'zone_challenge', name: 'Explorer', icon: '🗺️', target: 10, type: 'zones', reward: { heroSouls: 2 }, description: 'Advance 10 zones' },
            { id: 'skill_challenge', name: 'Skill Master', icon: '⚡', target: 10, type: 'skills', reward: { gold: 20000 }, description: 'Use skills 10 times' }
        ];
        
        // Generate 3 random daily challenges
        this.dailyChallenges = [];
        const shuffled = challengeTemplates.sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < 3; i++) {
            const challenge = { ...shuffled[i] };
            challenge.progress = 0;
            challenge.completed = false;
            this.dailyChallenges.push(challenge);
        }
    }
    
    updateDailyChallenges() {
        // Check if 24 hours have passed since last reset
        const now = Date.now();
        const timeSinceReset = now - this.lastChallengeReset;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (timeSinceReset >= twentyFourHours) {
            this.generateDailyChallenges();
            this.lastChallengeReset = now;
            this.showMilestoneNotification('📅 Daily challenges refreshed!', '#6366F1');
        }
    }
    
    updateChallengeProgress(type, amount = 1) {
        this.dailyChallenges.forEach(challenge => {
            if (challenge.type === type && !challenge.completed) {
                challenge.progress += amount;
                if (challenge.progress >= challenge.target) {
                    challenge.completed = true;
                    this.completeDailyChallenge(challenge);
                }
            }
        });
    }
    
    completeDailyChallenge(challenge) {
        // Award rewards
        if (challenge.reward.gold) {
            this.gold += challenge.reward.gold;
            this.showFloatingText(`+${this.formatNumber(challenge.reward.gold)} gold!`, '#10B981');
        }
        if (challenge.reward.prestigePoints) {
            this.prestigePoints += challenge.reward.prestigePoints;
            this.showFloatingText(`+${challenge.reward.prestigePoints} Prestige Points!`, '#8B5CF6');
        }
        if (challenge.reward.heroSouls) {
            this.heroSouls += challenge.reward.heroSouls;
            this.totalHeroSouls += challenge.reward.heroSouls;
            this.showFloatingText(`+${challenge.reward.heroSouls} Hero Souls!`, '#EC4899');
        }
        
        this.showMilestoneNotification(`🏆 Challenge Complete: ${challenge.name}!`, '#F59E0B');
        this.updateDisplay();
        this.saveGame();
    }
    
    spawnMonster() {
        const zoneIndex = Math.min(this.zone - 1, this.zones.length - 1);
        const zone = this.zones[zoneIndex];
        const monsterIndex = (this.monstersKilled % 10) % zone.monsters.length;
        const monster = zone.monsters[monsterIndex];
        
        const isBoss = (this.monstersKilled % 10) === 9; // Boss every 10th monster
        
        // Check for special monster types
        const isElite = !isBoss && Math.random() < 0.1; // 10% chance for elite
        const isLegendary = !isBoss && !isElite && Math.random() < 0.005; // 0.5% chance for legendary
        
        let bossMultiplier = 1;
        let monsterName = monster.name;
        let emoji = monster.emoji;
        
        if (isBoss) {
            bossMultiplier = 10;
            monsterName = monster.boss;
        } else if (isLegendary) {
            bossMultiplier = 25;
            monsterName = `Legendary ${monster.name}`;
            emoji = `🌟${monster.emoji}`;
        } else if (isElite) {
            bossMultiplier = 3;
            monsterName = `Elite ${monster.name}`;
            emoji = `✨${monster.emoji}`;
        }
        
        // Much more generous gold scaling
        let baseGold = Math.floor(5 * Math.pow(1.15, this.zone - 1)); // Start at 5 gold, grow 15% per zone
        
        // Additional zone-based bonus
        if (this.zone >= 10) baseGold += Math.floor(this.zone * 2); // +2 gold per zone after zone 10
        if (this.zone >= 25) baseGold += Math.floor(this.zone * 5); // +5 gold per zone after zone 25
        if (this.zone >= 50) baseGold += Math.floor(this.zone * 10); // +10 gold per zone after zone 50
        
        this.currentMonster = {
            name: monsterName,
            emoji: emoji,
            maxHp: Math.floor(10 * Math.pow(1.55, this.zone - 1)) * bossMultiplier,
            currentHp: 0,
            goldReward: baseGold * bossMultiplier,
            isBoss: isBoss,
            isElite: isElite,
            isLegendary: isLegendary
        };
        
        this.currentMonster.currentHp = this.currentMonster.maxHp;
        this.updateMonsterDisplay();
        this.updateZoneDisplay();
    }
    
    spawnTreasureChest() {
        this.treasureChestActive = true;
        
        // Calculate treasure chest rewards based on current zone (much more generous)
        let baseGold = Math.floor(25 * Math.pow(1.2, this.zone - 1)); // Start at 25 gold base
        
        // Zone bonuses for treasures
        if (this.zone >= 10) baseGold += Math.floor(this.zone * 10); // +10 per zone after 10
        if (this.zone >= 25) baseGold += Math.floor(this.zone * 25); // +25 per zone after 25
        if (this.zone >= 50) baseGold += Math.floor(this.zone * 50); // +50 per zone after 50
        
        const goldMultiplier = 8 + Math.floor(this.zone / 5); // More generous multiplier
        
        this.currentMonster = {
            name: "Treasure Chest",
            emoji: "📦",
            maxHp: Math.floor(5 * Math.pow(1.3, this.zone - 1)), // Less HP than regular monsters
            currentHp: 0,
            goldReward: baseGold * goldMultiplier,
            isTreasure: true,
            isBoss: false
        };
        
        this.currentMonster.currentHp = this.currentMonster.maxHp;
        
        // Show special treasure notification
        this.showFloatingText('💎 Treasure Chest Appeared!', '#F59E0B');
        
        // Add special visual effect to monster area
        this.addTreasureEffect();
        
        this.updateMonsterDisplay();
        this.updateZoneDisplay();
    }
    
    addTreasureEffect() {
        const monsterImage = document.querySelector('.monster-image');
        if (!monsterImage) return;
        
        // Add golden glow effect
        monsterImage.style.filter = 'drop-shadow(0 0 20px #F59E0B) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        monsterImage.style.animation = 'treasureGlow 1s ease-in-out infinite alternate';
        
        // Add sparkle effect to monster container
        const monsterContainer = document.querySelector('.monster-container');
        if (monsterContainer) {
            monsterContainer.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)';
        }
    }
    
    removeTreasureEffect() {
        const monsterImage = document.querySelector('.monster-image');
        if (monsterImage) {
            monsterImage.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
            monsterImage.style.animation = 'monsterFloat 3s ease-in-out infinite';
        }
        
        const monsterContainer = document.querySelector('.monster-container');
        if (monsterContainer) {
            monsterContainer.style.background = 'none';
        }
    }
    
    attackMonster() {
        if (!this.currentMonster) return;
        
        const now = Date.now();
        const timeSinceLastClick = now - this.lastClickTime;
        
        // Enhanced combo system - clicks within 1 second maintain combo
        if (timeSinceLastClick < 1000) {
            this.comboCount++;
            this.comboMultiplier = Math.min(1 + (this.comboCount * 0.15), 5); // Max 5x combo, faster scaling
            
            // Show combo feedback
            if (this.comboCount % 5 === 0) {
                this.showFloatingText(`${this.comboCount}x COMBO!`, '#EC4899');
            }
        } else {
            if (this.comboCount >= 10) {
                this.showFloatingText('Combo ended!', '#64748B');
            }
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        this.lastClickTime = now;
        
        // Calculate damage
        let damage = this.clickDamage + this.calculateClickDamageBonus();
        
        // Apply skill bonuses
        if (this.skillEffects.berserkerMode.active) {
            damage *= 3; // Berserker mode
        }
        
        // Apply combo multiplier
        damage *= this.comboMultiplier;
        
        // Critical hit calculation
        let critChance = this.criticalHitChance;
        if (this.skillEffects.luckyStrike.active) {
            critChance = 1; // 100% crit chance
        }
        
        const isCritical = Math.random() < critChance;
        if (isCritical) {
            damage *= this.criticalHitMultiplier;
        }
        
        // Apply damage
        this.currentMonster.currentHp -= damage;
        this.statistics.totalDamageDealt += damage;
        this.statistics.totalClicks++;
        
        // Update daily challenges
        this.updateChallengeProgress('clicks');
        
        // Visual effects
        this.showDamageNumber(damage, isCritical);
        this.addClickEffect();
        
        if (this.currentMonster.currentHp <= 0) {
            this.killMonster();
        }
        
        this.updateMonsterDisplay();
        this.checkAchievements();
    }
    
    showDamageNumber(damage, isCritical = false) {
        if (!this.settings.damageNumbersEnabled) return;
        
        const damageContainer = document.getElementById('damage-numbers');
        if (!damageContainer) return;
        
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-number';
        damageElement.textContent = this.formatNumber(Math.floor(damage));
        
        if (isCritical) {
            damageElement.style.color = '#ff4444';
            damageElement.style.fontSize = '2rem';
            damageElement.textContent = 'CRIT! ' + damageElement.textContent;
        }
        
        // Random positioning
        const randomX = (Math.random() - 0.5) * 100;
        damageElement.style.left = randomX + 'px';
        
        damageContainer.appendChild(damageElement);
        
        // Remove after animation
        setTimeout(() => {
            if (damageElement.parentNode) {
                damageElement.parentNode.removeChild(damageElement);
            }
        }, 1500);
    }
    
    addClickEffect() {
        const monsterImage = document.querySelector('.monster-image');
        if (!monsterImage) return;
        
        monsterImage.style.transform = 'scale(0.95)';
        setTimeout(() => {
            monsterImage.style.transform = 'scale(1)';
        }, 100);
    }
    
    killMonster() {
        let goldEarned = this.currentMonster.goldReward;
        
        // Apply gold bonuses
        const goldBonus = this.getUpgradeValue('goldBonus');
        const prestigeGoldBonus = this.getPrestigeBonus('goldMultiplier');
        const equipmentGoldBonus = this.getEquipmentBonus('goldBonus');
        const goldenTouchBonus = this.skillEffects.goldenTouch.active ? 3 : 1;
        goldEarned *= (1 + goldBonus + prestigeGoldBonus + equipmentGoldBonus) * goldenTouchBonus;
        
        this.gold += goldEarned;
        this.statistics.totalGoldEarned += goldEarned;
        this.monstersKilled++;
        
        // Update daily challenges
        this.updateChallengeProgress('monsters');
        this.updateChallengeProgress('gold', goldEarned);
        
        // Handle treasure chest completion
        if (this.currentMonster.isTreasure) {
            this.treasureChestActive = false;
            this.removeTreasureEffect();
            
            // Update treasure statistics
            this.statistics.treasureChestsFound++;
            this.statistics.treasureGoldEarned += goldEarned;
            
            // Update daily challenges
            this.updateChallengeProgress('treasures');
            
            // Show special treasure reward
            this.showFloatingText(`💰 TREASURE! +${this.formatNumber(Math.floor(goldEarned))} gold`, '#F59E0B');
            this.showFloatingText('✨ Bonus Gold! ✨', '#FFD700');
            
            // Don't count treasure chests towards monster kill count
            this.monstersKilled--; // Compensate for the increment above
            
            this.spawnMonster(); // Spawn regular monster after treasure
            this.updateDisplay();
            this.checkAchievements(); // Check for treasure-related achievements
            return;
        }
        
        // Check for equipment drops (higher chance for special monsters)
        this.checkEquipmentDrop();
        
        // Show special rewards for legendary monsters
        if (this.currentMonster.isLegendary) {
            this.showFloatingText('🌟 LEGENDARY SLAIN! 🌟', '#F59E0B');
            this.showFloatingText('Bonus rewards!', '#8B5CF6');
        } else if (this.currentMonster.isElite) {
            this.showFloatingText('✨ Elite defeated!', '#F59E0B');
        }
        
        // Show regular gold earned
        this.showFloatingText(`+${this.formatNumber(Math.floor(goldEarned))} gold`, '#10B981');
        
        // Check for treasure chest spawn (only for regular monsters, not bosses)
        if (!this.currentMonster.isBoss && !this.treasureChestActive && Math.random() < this.treasureChestChance) {
            this.spawnTreasureChest();
            return; // Don't spawn regular monster yet
        }
        
        // Progress to next zone every 10 monsters
        if (this.monstersKilled % 10 === 0) {
            this.zone++;
            this.statistics.highestZone = Math.max(this.statistics.highestZone, this.zone);
            this.showFloatingText(`Zone ${this.zone}!`, '#6366F1');
            
            // Update daily challenges
            this.updateChallengeProgress('zones');
            
            // Show milestone notifications
            this.checkZoneMilestones();
        }
        
        this.spawnMonster();
        this.updateDisplay();
        this.checkAscensionAvailability();
        this.checkAchievements();
    }
    
    ascend() {
        if (this.zone < 100) return;
        
        const soulsGained = Math.floor((this.zone - 99) / 5);
        
        // Calculate prestige points (new!)
        const prestigeGained = Math.floor(this.zone / 50); // 1 prestige point per 50 zones
        
        this.heroSouls += soulsGained;
        this.totalHeroSouls += soulsGained;
        this.prestigePoints += prestigeGained;
        this.totalPrestigePoints += prestigeGained;
        this.statistics.totalAscensions++;
        this.statistics.totalPrestigeGained += prestigeGained;
        
        // Reset progress
        this.gold = 0;
        this.zone = 1;
        this.monstersKilled = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.treasureChestActive = false;
        
        // Reset heroes
        this.heroes.forEach(hero => {
            hero.level = 0;
            hero.owned = false;
            hero.currentCost = hero.baseCost;
        });
        
        // Reset some upgrades (keep prestige upgrades)
        this.upgrades.forEach(upgrade => {
            if (upgrade.effect !== 'autoClick') { // Keep auto-clicker
                upgrade.purchased = false;
            }
        });
        
        this.spawnMonster();
        this.closeAscensionModal();
        this.updateDisplay();
        this.saveGame();
        this.checkAchievements();
        
        // Show prestige notification if gained
        if (prestigeGained > 0) {
            this.showFloatingText(`+${prestigeGained} Prestige Points!`, '#8B5CF6');
        }
    }
    
    showFloatingText(text, color = '#FFD700') {
        const container = document.querySelector('.monster-area');
        if (!container) return;
        
        const textElement = document.createElement('div');
        textElement.style.position = 'absolute';
        textElement.style.color = color;
        textElement.style.fontWeight = 'bold';
        textElement.style.fontSize = '1.2rem';
        textElement.style.pointerEvents = 'none';
        textElement.style.zIndex = '1000';
        textElement.style.animation = 'damageFloat 2s ease-out forwards';
        textElement.textContent = text;
        
        const rect = container.getBoundingClientRect();
        textElement.style.left = (rect.width / 2) + 'px';
        textElement.style.top = '50%';
        textElement.style.transform = 'translateX(-50%)';
        
        container.style.position = 'relative';
        container.appendChild(textElement);
        
        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 2000);
    }
    
    getUpgradeValue(effect) {
        return this.upgrades
            .filter(upgrade => upgrade.purchased && upgrade.effect === effect)
            .reduce((total, upgrade) => total + upgrade.value, 0);
    }
    
    calculateClickDamageBonus() {
        let bonus = 0;
        
        // Hero souls bonus
        bonus += Math.floor(this.clickDamage * (this.totalHeroSouls * 0.1));
        
        // Upgrades bonus
        bonus += this.getUpgradeValue('clickDamage');
        
        // Prestige bonus
        bonus += this.getPrestigeBonus('clickDamage');
        
        // Equipment bonus
        bonus += this.getEquipmentBonus('clickDamage');
        
        return bonus;
    }
    
    calculateTotalDps() {
        let totalDps = 0;
        
        // Hero DPS
        this.heroes.forEach(hero => {
            if (hero.owned && hero.level > 0) {
                totalDps += hero.baseDps * hero.level;
            }
        });
        
        // Apply hero DPS bonuses
        const heroDpsBonus = this.getUpgradeValue('heroDpsBonus');
        const prestigeHeroBonus = this.getPrestigeBonus('heroDpsBonus');
        const equipmentHeroBonus = this.getEquipmentBonus('heroDpsBonus');
        const heroRallyBonus = this.skillEffects.heroRally.active ? 3 : 1;
        totalDps *= (1 + heroDpsBonus + prestigeHeroBonus + equipmentHeroBonus) * heroRallyBonus;
        
        // Apply hero souls bonus
        totalDps += totalDps * (this.totalHeroSouls * 0.1);
        
        return Math.floor(totalDps);
    }
    
    hireHero(heroIndex) {
        const hero = this.heroes[heroIndex];
        if (this.gold >= hero.currentCost) {
            this.gold -= hero.currentCost;
            hero.owned = true;
            hero.level = 1;
            this.updateHeroCost(heroIndex);
            this.updateDisplay();
            this.checkAchievements();
        }
    }
    
    upgradeHero(heroIndex) {
        const hero = this.heroes[heroIndex];
        if (hero.owned && this.gold >= hero.currentCost) {
            this.gold -= hero.currentCost;
            hero.level++;
            this.updateHeroCost(heroIndex);
            this.updateDisplay();
        }
    }
    
    upgradeHeroMax(heroIndex) {
        const hero = this.heroes[heroIndex];
        if (!hero.owned) return;
        
        let totalCost = 0;
        let levelsToAdd = 0;
        let tempGold = this.gold;
        let tempLevel = hero.level;
        
        // Calculate how many levels we can afford
        while (tempGold > 0) {
            const levelCost = Math.floor(hero.baseCost * Math.pow(hero.costMultiplier, tempLevel));
            if (tempGold >= levelCost) {
                tempGold -= levelCost;
                totalCost += levelCost;
                levelsToAdd++;
                tempLevel++;
            } else {
                break;
            }
            
            // Safety limit to prevent infinite loops
            if (levelsToAdd >= 1000) break;
        }
        
        if (levelsToAdd > 0) {
            this.gold -= totalCost;
            hero.level += levelsToAdd;
            this.updateHeroCost(heroIndex);
            this.showFloatingText(`+${levelsToAdd} levels!`, '#10B981');
            this.updateDisplay();
        }
    }
    
    autoHireCheapestHero() {
        // Find the cheapest unhired hero that we can afford
        const affordableHeroes = this.heroes
            .map((hero, index) => ({ hero, index }))
            .filter(({ hero }) => !hero.owned && this.gold >= hero.currentCost)
            .sort((a, b) => a.hero.currentCost - b.hero.currentCost);
        
        if (affordableHeroes.length > 0) {
            const { index } = affordableHeroes[0];
            this.hireHero(index);
            this.showFloatingText(`Auto-hired ${this.heroes[index].name}!`, '#6366F1');
        } else {
            this.showFloatingText('No affordable heroes!', '#EF4444');
        }
    }
    
    autoUpgradeCheapestUpgrade() {
        // Find the cheapest unpurchased upgrade we can afford
        const affordableUpgrades = this.upgrades
            .filter(upgrade => !upgrade.purchased && this.gold >= upgrade.cost)
            .sort((a, b) => a.cost - b.cost);
        
        if (affordableUpgrades.length > 0) {
            const upgrade = affordableUpgrades[0];
            this.purchaseUpgrade(upgrade.id);
            this.showFloatingText(`Auto-bought ${upgrade.name}!`, '#8B5CF6');
        } else {
            this.showFloatingText('No affordable upgrades!', '#EF4444');
        }
    }
    
    checkZoneMilestones() {
        // Show helpful tips and notifications at key zones
        switch(this.zone) {
            case 5:
                this.showMilestoneNotification('🎯 Tip: Berserker Mode skill unlocked! Press W to use it.', '#8B5CF6');
                break;
            case 10:
                this.showMilestoneNotification('🍀 Lucky Strike unlocked! Press E for guaranteed crits.', '#F59E0B');
                break;
            case 15:
                this.showMilestoneNotification('👑 Hero Rally unlocked! Press R to boost hero DPS.', '#EC4899');
                break;
            case 25:
                this.showMilestoneNotification('⏰ Time Warp unlocked! Press T to speed up the game.', '#3B82F6');
                break;
            case 50:
                this.showMilestoneNotification('🌟 Halfway to ascension! Keep pushing for Hero Souls.', '#10B981');
                break;
            case 100:
                this.showMilestoneNotification('🚀 Ascension available! You can now gain Hero Souls.', '#6366F1');
                break;
        }
    }
    
    showMilestoneNotification(message, color = '#6366F1') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-weight: 600;
            max-width: 400px;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.2);
            animation: slideInDown 0.5s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
        
        // Click to close early
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutUp 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        });
    }
    
    checkEquipmentDrop() {
        let dropChance = 0.02; // 2% base chance
        
        // Increase drop chance for special monsters
        if (this.currentMonster.isLegendary) {
            dropChance = 0.8; // 80% chance for legendary
        } else if (this.currentMonster.isBoss) {
            dropChance = 0.3; // 30% chance for boss
        } else if (this.currentMonster.isElite) {
            dropChance = 0.15; // 15% chance for elite
        }
        
        if (Math.random() < dropChance) {
            this.generateEquipmentDrop();
        }
    }
    
    generateEquipmentDrop() {
        // Determine rarity based on zone and monster type
        let rarity = 'common';
        const rarityRoll = Math.random();
        
        if (this.currentMonster.isLegendary) {
            rarity = rarityRoll < 0.5 ? 'legendary' : rarityRoll < 0.8 ? 'rare' : 'uncommon';
        } else if (this.currentMonster.isBoss) {
            rarity = rarityRoll < 0.2 ? 'rare' : rarityRoll < 0.6 ? 'uncommon' : 'common';
        } else if (this.currentMonster.isElite) {
            rarity = rarityRoll < 0.4 ? 'uncommon' : 'common';
        } else {
            rarity = rarityRoll < 0.05 ? 'uncommon' : 'common';
        }
        
        // Filter equipment by rarity
        const possibleDrops = this.equipmentTemplates.filter(item => {
            return item.rarity === rarity;
        });
        
        if (possibleDrops.length > 0) {
            const droppedItem = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
            const newItem = {
                ...droppedItem,
                id: Date.now(),
                dropZone: this.zone
            };
            
            this.inventory.push(newItem);
            this.showEquipmentDrop(newItem);
        }
    }
    
    showEquipmentDrop(item) {
        const rarityColors = {
            common: '#64748B',
            uncommon: '#10B981', 
            rare: '#8B5CF6',
            legendary: '#F59E0B'
        };
        
        this.showFloatingText(`${item.icon} ${item.name} dropped!`, rarityColors[item.rarity]);
        
        // Auto-equip if better
        this.autoEquipItem(item);
    }
    
    autoEquipItem(item) {
        const currentEquipped = this.equipment[item.type];
        
        // Auto-equip if slot is empty or new item is better
        if (!currentEquipped || this.isItemBetter(item, currentEquipped)) {
            this.equipment[item.type] = item;
            this.showFloatingText(`${item.name} equipped!`, '#10B981');
            this.updateDisplay();
            this.saveGame();
        }
    }
    
    updateChallengesDisplay() {
        const challengesGrid = document.getElementById('challenges-grid');
        if (!challengesGrid) return;
        
        challengesGrid.innerHTML = '';
        
        this.dailyChallenges.forEach(challenge => {
            const challengeCard = document.createElement('div');
            challengeCard.className = `challenge-card ${challenge.completed ? 'completed' : ''}`;
            
            const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
            
            challengeCard.innerHTML = `
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-name">${challenge.name}</div>
                </div>
                <div class="challenge-description">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="challenge-progress-text">${Math.min(challenge.progress, challenge.target)} / ${challenge.target}</div>
                </div>
                ${challenge.completed ? 
                    '<div class="challenge-completed">✅ Completed!</div>' :
                    `<div class="challenge-reward">
                        ${challenge.reward.gold ? `💰 ${this.formatNumber(challenge.reward.gold)} Gold` : ''}
                        ${challenge.reward.prestigePoints ? `🌟 ${challenge.reward.prestigePoints} PP` : ''}
                        ${challenge.reward.heroSouls ? `👻 ${challenge.reward.heroSouls} Souls` : ''}
                    </div>`
                }
            `;
            
            challengesGrid.appendChild(challengeCard);
        });
        
        // Update timer
        const timerElement = document.getElementById('challenges-timer');
        if (timerElement) {
            const timeUntilReset = 24 * 60 * 60 * 1000 - (Date.now() - this.lastChallengeReset);
            const hours = Math.floor(timeUntilReset / (60 * 60 * 1000));
            const minutes = Math.floor((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));
            timerElement.textContent = `Resets in: ${hours}h ${minutes}m`;
        }
    }
    
    updateEquipmentDisplay() {
        // Update equipped slots
        ['weapon', 'armor', 'accessory'].forEach(type => {
            const slotElement = document.getElementById(`equipped-${type}`);
            const slotContainer = document.getElementById(`${type}-slot`);
            
            if (slotElement && slotContainer) {
                const equippedItem = this.equipment[type];
                if (equippedItem) {
                    const sellValue = this.calculateItemSellValue(equippedItem);
                    slotElement.innerHTML = `
                        <div class="equipped-item-info">
                            <div class="equipped-item-name">${equippedItem.icon} ${equippedItem.name}</div>
                            <div class="equipped-item-stats">${equippedItem.description}</div>
                            <button class="equipped-sell-btn" onclick="game.sellEquippedItem('${type}')">
                                💰 Sell (${this.formatNumber(sellValue)})
                            </button>
                        </div>
                    `;
                    slotElement.className = 'slot-item equipped';
                } else {
                    slotElement.innerHTML = '<div class="empty-slot">None</div>';
                    slotElement.className = 'slot-item';
                }
            }
        });
        
        // Update inventory
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;
        
        inventoryGrid.innerHTML = '';
        
        if (this.inventory.length === 0) {
            inventoryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No items in inventory. Kill monsters to find equipment!</div>';
            return;
        }
        
        this.inventory.forEach((item, index) => {
            const inventoryItem = document.createElement('div');
            inventoryItem.className = `inventory-item ${item.rarity}`;
            
            // Remove the onclick since we now have buttons
            
            const sellValue = this.calculateItemSellValue(item);
            
            inventoryItem.innerHTML = `
                <div class="item-header">
                    <div class="item-icon">${item.icon}</div>
                    <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-type">${item.rarity} ${item.type}</div>
                    </div>
                </div>
                <div class="item-description">${item.description}</div>
                <div class="item-stats">Zone ${item.dropZone}</div>
                <div class="item-actions">
                    <button class="item-action-btn equip-btn" onclick="event.stopPropagation(); game.equipItem(${index})">
                        ⚔️ Equip
                    </button>
                    <button class="item-action-btn sell-btn" onclick="event.stopPropagation(); game.sellItem(${index})">
                        💰 Sell (${this.formatNumber(sellValue)})
                    </button>
                </div>
            `;
            
            inventoryGrid.appendChild(inventoryItem);
        });
    }
    
    equipItem(inventoryIndex) {
        const item = this.inventory[inventoryIndex];
        if (!item) return;
        
        // Move current equipped item back to inventory if it exists
        const currentEquipped = this.equipment[item.type];
        if (currentEquipped) {
            this.inventory.push(currentEquipped);
        }
        
        // Equip the new item
        this.equipment[item.type] = item;
        
        // Remove from inventory
        this.inventory.splice(inventoryIndex, 1);
        
        this.showFloatingText(`${item.name} equipped!`, '#10B981');
        this.updateDisplay();
        this.saveGame();
    }
    
    calculateItemSellValue(item) {
        // Base values by rarity
        const baseValues = {
            common: 100,
            uncommon: 250,
            rare: 750,
            legendary: 2500
        };
        
        // Zone multiplier (items from higher zones worth more)
        const zoneMultiplier = 1 + (item.dropZone * 0.1);
        
        return Math.floor(baseValues[item.rarity] * zoneMultiplier);
    }
    
    sellItem(inventoryIndex) {
        const item = this.inventory[inventoryIndex];
        if (!item) return;
        
        const sellValue = this.calculateItemSellValue(item);
        
        // Add gold
        this.gold += sellValue;
        this.statistics.totalGoldEarned += sellValue;
        
        // Remove from inventory
        this.inventory.splice(inventoryIndex, 1);
        
        // Show feedback
        this.showFloatingText(`${item.name} sold!`, '#F59E0B');
        this.showFloatingText(`+${this.formatNumber(sellValue)} gold`, '#10B981');
        
        // Update challenge progress
        this.updateChallengeProgress('gold', sellValue);
        
        this.updateDisplay();
        this.saveGame();
    }
    
    sellEquippedItem(equipmentType) {
        const item = this.equipment[equipmentType];
        if (!item) return;
        
        const sellValue = this.calculateItemSellValue(item);
        
        // Add gold
        this.gold += sellValue;
        this.statistics.totalGoldEarned += sellValue;
        
        // Remove equipped item
        this.equipment[equipmentType] = null;
        
        // Show feedback
        this.showFloatingText(`${item.name} sold!`, '#F59E0B');
        this.showFloatingText(`+${this.formatNumber(sellValue)} gold`, '#10B981');
        
        // Update challenge progress
        this.updateChallengeProgress('gold', sellValue);
        
        this.updateDisplay();
        this.saveGame();
    }
    
    isItemBetter(newItem, currentItem) {
        // Simple comparison based on total stat values
        const newPower = Object.values(newItem.stats).reduce((sum, val) => sum + (typeof val === 'number' ? Math.abs(val * 100) : 0), 0);
        const currentPower = Object.values(currentItem.stats).reduce((sum, val) => sum + (typeof val === 'number' ? Math.abs(val * 100) : 0), 0);
        return newPower > currentPower;
    }
    
    getEquipmentBonus(stat) {
        let bonus = 0;
        Object.values(this.equipment).forEach(item => {
            if (item && item.stats[stat]) {
                bonus += item.stats[stat];
            }
        });
        return bonus;
    }
    
    updateHeroCost(heroIndex) {
        const hero = this.heroes[heroIndex];
        hero.currentCost = Math.floor(hero.baseCost * Math.pow(hero.costMultiplier, hero.level));
    }
    
    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased || this.gold < upgrade.cost) return;
        
        this.gold -= upgrade.cost;
        upgrade.purchased = true;
        
        // Apply upgrade effects
        switch(upgrade.effect) {
            case 'clickDamage':
                this.clickDamage += upgrade.value;
                break;
            case 'critChance':
                this.criticalHitChance += upgrade.value;
                break;
            case 'critMultiplier':
                this.criticalHitMultiplier += upgrade.value;
                break;
        }
        
        this.updateDisplay();
    }
    
    purchasePrestigeUpgrade(upgradeId) {
        const upgrade = this.prestigeUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
        
        const cost = upgrade.cost * Math.pow(2, upgrade.level);
        if (this.prestigePoints < cost) return;
        
        this.prestigePoints -= cost;
        upgrade.level++;
        
        // Apply prestige upgrade effects
        this.applyPrestigeEffects();
        
        this.showFloatingText(`${upgrade.name} upgraded!`, '#8B5CF6');
        this.updateDisplay();
        this.saveGame();
    }
    
    applyPrestigeEffects() {
        // Apply prestige bonuses to various game mechanics
        const treasureUpgrade = this.prestigeUpgrades.find(u => u.id === 'treasure_hunter');
        const equipmentTreasureBonus = this.getEquipmentBonus('treasureChance');
        if (treasureUpgrade) {
            this.treasureChestChance = 0.05 + (treasureUpgrade.level * 0.02) + equipmentTreasureBonus; // Base 5% + upgrades + equipment
        } else {
            this.treasureChestChance = 0.05 + equipmentTreasureBonus;
        }
    }
    
    getPrestigeBonus(effect) {
        return this.prestigeUpgrades
            .filter(upgrade => upgrade.effect === effect)
            .reduce((total, upgrade) => total + (upgrade.value * upgrade.level), 0);
    }
    
    useSkill(skillId) {
        const skill = this.activeSkills.find(s => s.id === skillId);
        if (!skill) return;
        
        const now = Date.now();
        const timeSinceLastUse = now - skill.lastUsed;
        
        // Check if skill is unlocked
        if (this.zone < skill.unlockZone) {
            this.showFloatingText(`Unlocks at Zone ${skill.unlockZone}`, '#EF4444');
            return;
        }
        
        // Check if skill is on cooldown
        if (timeSinceLastUse < skill.cooldown) {
            const remainingTime = Math.ceil((skill.cooldown - timeSinceLastUse) / 1000);
            this.showFloatingText(`Cooldown: ${remainingTime}s`, '#F59E0B');
            return;
        }
        
        // Activate skill
        skill.lastUsed = now;
        skill.timesUsed++;
        this.skillEffects[skillId].active = true;
        this.skillEffects[skillId].endTime = now + skill.duration;
        
        // Show activation message
        this.showFloatingText(`${skill.name} Activated!`, '#8B5CF6');
        
        // Update daily challenges
        this.updateChallengeProgress('skills');
        
        // Add visual effects based on skill
        this.addSkillVisualEffect(skillId);
        
        this.updateDisplay();
        this.saveGame();
    }
    
    addSkillVisualEffect(skillId) {
        const attackButton = document.getElementById('attack-btn');
        const body = document.body;
        
        switch(skillId) {
            case 'berserkerMode':
                if (attackButton) {
                    attackButton.style.boxShadow = '0 0 20px #EF4444, var(--shadow-medium)';
                    attackButton.style.borderColor = '#EF4444';
                }
                break;
            case 'goldenTouch':
                body.style.filter = 'sepia(0.3) saturate(1.5) hue-rotate(25deg)';
                break;
            case 'luckyStrike':
                if (attackButton) {
                    attackButton.style.boxShadow = '0 0 20px #F59E0B, var(--shadow-medium)';
                    attackButton.style.borderColor = '#F59E0B';
                }
                break;
            case 'timeWarp':
                body.style.filter = 'hue-rotate(180deg) saturate(1.5)';
                break;
            case 'heroRally':
                // Add glow to heroes section
                const heroesSection = document.querySelector('.heroes-section');
                if (heroesSection) {
                    heroesSection.style.boxShadow = '0 0 20px #8B5CF6, var(--shadow-medium)';
                }
                break;
        }
    }
    
    removeSkillVisualEffect(skillId) {
        const attackButton = document.getElementById('attack-btn');
        const body = document.body;
        const heroesSection = document.querySelector('.heroes-section');
        
        switch(skillId) {
            case 'berserkerMode':
                if (attackButton) {
                    attackButton.style.boxShadow = 'var(--shadow-medium)';
                    attackButton.style.borderColor = 'var(--border-color)';
                }
                break;
            case 'goldenTouch':
                body.style.filter = 'none';
                break;
            case 'luckyStrike':
                if (attackButton) {
                    attackButton.style.boxShadow = 'var(--shadow-medium)';
                    attackButton.style.borderColor = 'var(--border-color)';
                }
                break;
            case 'timeWarp':
                body.style.filter = 'none';
                break;
            case 'heroRally':
                if (heroesSection) {
                    heroesSection.style.boxShadow = 'var(--shadow-medium)';
                }
                break;
        }
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                achievement.dateUnlocked = new Date();
                this.showAchievementUnlocked(achievement);
            }
        });
    }
    
    showAchievementUnlocked(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        notification.style.color = '#000';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.5)';
        notification.style.zIndex = '10000';
        notification.style.animation = 'slideInRight 0.5s ease-out';
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 0.5rem;">🏆 Achievement Unlocked!</div>
            <div>${achievement.icon} ${achievement.name}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">${achievement.description}</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    checkAscensionAvailability() {
        if (this.zone >= 100) {
            const soulsToGain = Math.floor((this.zone - 99) / 5);
            document.getElementById('souls-to-gain').textContent = soulsToGain;
            document.getElementById('soul-bonus-preview').textContent = Math.floor(soulsToGain * 10);
            document.getElementById('ascension-modal').style.display = 'flex';
        }
    }
    
    ascend() {
        if (this.zone < 100) return;
        
        const soulsGained = Math.floor((this.zone - 99) / 5);
        this.heroSouls += soulsGained;
        this.totalHeroSouls += soulsGained;
        this.statistics.totalAscensions++;
        
        // Reset progress
        this.gold = 0;
        this.zone = 1;
        this.monstersKilled = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
        
        // Reset heroes
        this.heroes.forEach(hero => {
            hero.level = 0;
            hero.owned = false;
            hero.currentCost = hero.baseCost;
        });
        
        // Reset some upgrades
        this.upgrades.forEach(upgrade => {
            if (upgrade.effect !== 'autoClick') { // Keep auto-clicker
                upgrade.purchased = false;
            }
        });
        
        this.spawnMonster();
        this.closeAscensionModal();
        this.updateDisplay();
        this.saveGame();
        this.checkAchievements();
    }
    
    startGameLoop() {
        // Main game loop
        setInterval(() => {
            const now = Date.now();
            
            // Update skill effects
            this.updateSkillEffects(now);
            
            if (this.currentMonster && this.dps > 0) {
                let damage = this.dps / 10; // 10 ticks per second
                
                // Apply time warp effect to DPS
                if (this.skillEffects.timeWarp.active) {
                    damage *= 2;
                }
                
                this.currentMonster.currentHp -= damage;
                this.statistics.totalDamageDealt += damage;
                
                if (this.currentMonster.currentHp <= 0) {
                    this.killMonster();
                }
                
                this.updateMonsterDisplay();
            }
            
            // Auto-clicker
            const autoClickLevel = this.getUpgradeValue('autoClick');
            if (autoClickLevel > 0 && Math.random() < 0.1) { // 10% chance per tick
                this.attackMonster();
            }
            
            // Check daily challenges reset (every hour for testing, normally 24h)
            this.updateDailyChallenges();
            
            // Auto-save every 30 seconds (but not if we're resetting)
            if (!this.skipLoad && Date.now() - this.lastSave > 30000) {
                this.saveGame();
                this.lastSave = Date.now();
            }
        }, 100);
        
        // Update DPS every second
        setInterval(() => {
            this.dps = this.calculateTotalDps();
            this.updateDisplay();
        }, 1000);
        
        // Update critical hit chance
        setInterval(() => {
            this.criticalHitChance = 0.05 + this.getUpgradeValue('critChance') + this.getPrestigeBonus('critChance') + this.getEquipmentBonus('critChance');
            this.criticalHitMultiplier = 2 + this.getUpgradeValue('critMultiplier') + this.getEquipmentBonus('critMultiplier');
        }, 1000);
    }
    
    updateDisplay() {
        // Header stats
        document.getElementById('gold').textContent = this.formatNumber(this.gold);
        document.getElementById('hero-souls-header').textContent = this.totalHeroSouls;
        document.getElementById('zone-header').textContent = this.zone;
        
        // Equipment count
        const equippedCount = Object.values(this.equipment).filter(item => item !== null).length;
        const equipmentCountElement = document.getElementById('equipment-count');
        if (equipmentCountElement) {
            equipmentCountElement.textContent = equippedCount;
        }
        
        const equipmentCountDisplayElement = document.getElementById('equipment-count-display');
        if (equipmentCountDisplayElement) {
            equipmentCountDisplayElement.textContent = equippedCount;
        }
        
        // Combat stats
        document.getElementById('click-damage').textContent = this.formatNumber(this.clickDamage + this.calculateClickDamageBonus());
        document.getElementById('dps').textContent = this.formatNumber(this.dps);
        document.getElementById('monsters-killed').textContent = this.monstersKilled;
        document.getElementById('zone').textContent = this.zone;
        
        // Ascension info
        document.getElementById('hero-souls').textContent = this.heroSouls;
        document.getElementById('soul-bonus').textContent = Math.floor(this.totalHeroSouls * 10);
        
        this.updateHeroesDisplay();
        this.updateUpgradesDisplay();
        this.updateAchievementsDisplay();
        this.updateStatisticsDisplay();
        this.updatePrestigeDisplay();
        this.updateSkillsDisplay();
        this.updateChallengesDisplay();
        this.updateEquipmentDisplay();
    }
    
    updateZoneDisplay() {
        const zoneIndex = Math.min(this.zone - 1, this.zones.length - 1);
        const zoneName = this.zones[zoneIndex].name;
        document.getElementById('zone-name').textContent = zoneName;
        
        const monsterCount = (this.monstersKilled % 10) + 1;
        document.getElementById('monster-count').textContent = monsterCount;
    }
    
    updateMonsterDisplay() {
        if (!this.currentMonster) return;
        
        const monsterNameElement = document.getElementById('monster-name');
        const monsterImageElement = document.querySelector('.monster-image');
        
        monsterNameElement.textContent = this.currentMonster.name;
        monsterImageElement.textContent = this.currentMonster.emoji;
        
        // Add special styling for different monster types
        if (this.currentMonster.isLegendary) {
            monsterNameElement.style.color = '#F59E0B';
            monsterNameElement.style.textShadow = '0 0 15px #F59E0B';
            monsterImageElement.style.filter = 'drop-shadow(0 0 20px #F59E0B) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        } else if (this.currentMonster.isElite) {
            monsterNameElement.style.color = '#8B5CF6';
            monsterNameElement.style.textShadow = '0 0 10px #8B5CF6';
            monsterImageElement.style.filter = 'drop-shadow(0 0 15px #8B5CF6) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        } else if (this.currentMonster.isBoss) {
            monsterNameElement.style.color = '#EF4444';
            monsterNameElement.style.textShadow = '0 0 10px #EF4444';
            monsterImageElement.style.filter = 'drop-shadow(0 0 15px #EF4444) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        } else if (this.currentMonster.isTreasure) {
            monsterNameElement.style.color = '#F59E0B';
            monsterNameElement.style.textShadow = '0 0 15px #F59E0B';
            monsterImageElement.style.filter = 'drop-shadow(0 0 20px #F59E0B) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        } else {
            monsterNameElement.style.color = 'var(--text-primary)';
            monsterNameElement.style.textShadow = 'none';
            monsterImageElement.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
        }
        
        document.getElementById('monster-current-hp').textContent = this.formatNumber(Math.max(0, Math.floor(this.currentMonster.currentHp)));
        document.getElementById('monster-max-hp').textContent = this.formatNumber(this.currentMonster.maxHp);
        
        const hpPercentage = (this.currentMonster.currentHp / this.currentMonster.maxHp) * 100;
        document.getElementById('hp-bar').style.width = Math.max(0, hpPercentage) + '%';
        
        // Change HP bar color based on monster type and percentage
        const hpBar = document.getElementById('hp-bar');
        if (this.currentMonster.isTreasure) {
            hpBar.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
        } else if (this.currentMonster.isLegendary) {
            hpBar.style.background = 'linear-gradient(90deg, #F59E0B, #FF6B35)';
        } else if (this.currentMonster.isElite) {
            hpBar.style.background = 'linear-gradient(90deg, #8B5CF6, #7C3AED)';
        } else if (this.currentMonster.isBoss) {
            hpBar.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
        } else {
            if (hpPercentage > 60) {
                hpBar.style.background = 'var(--gradient-success)';
            } else if (hpPercentage > 30) {
                hpBar.style.background = 'linear-gradient(90deg, #F59E0B, #D97706)';
            } else {
                hpBar.style.background = 'linear-gradient(90deg, #EF4444, #DC2626)';
            }
        }
    }
    
    updateHeroesDisplay() {
        const herosList = document.getElementById('heroes-list');
        herosList.innerHTML = '';
        
        let heroesOwned = 0;
        let totalHeroDps = 0;
        
        this.heroes.forEach((hero, index) => {
            if (!hero.owned && this.gold < hero.currentCost && index > 0) {
                const prevHero = this.heroes[index - 1];
                if (!prevHero.owned) return;
            }
            
            if (hero.owned) {
                heroesOwned++;
                totalHeroDps += hero.baseDps * hero.level;
            }
            
            const heroDiv = document.createElement('div');
            const canAfford = this.gold >= hero.currentCost;
            heroDiv.className = `hero-card ${hero.owned ? 'owned' : ''} ${canAfford ? 'affordable' : ''}`;
            
            const heroDps = hero.owned && hero.level > 0 ? hero.baseDps * hero.level : 0;
            
            heroDiv.innerHTML = `
                <div class="hero-avatar">${hero.emoji}</div>
                <div class="hero-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-stats">
                        <div>Level: ${hero.level}</div>
                        <div>DPS: ${this.formatNumber(heroDps)}</div>
                    </div>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">${hero.description}</div>
                </div>
                <div class="hero-actions">
                    <div class="hero-cost">${this.formatNumber(hero.currentCost)} gold</div>
                    <div class="hero-buttons">
                        ${hero.owned 
                            ? `<button class="hero-button" onclick="game.upgradeHero(${index})" ${this.gold < hero.currentCost ? 'disabled' : ''}>+1</button>
                               <button class="hero-button-small" onclick="game.upgradeHeroMax(${index})" ${this.gold < hero.currentCost ? 'disabled' : ''}>Max</button>`
                            : `<button class="hero-button" onclick="game.hireHero(${index})" ${this.gold < hero.currentCost ? 'disabled' : ''}>Hire</button>`
                        }
                    </div>
                </div>
            `;
            
            herosList.appendChild(heroDiv);
        });
        
        document.getElementById('heroes-owned').textContent = heroesOwned;
        document.getElementById('total-hero-dps').textContent = this.formatNumber(totalHeroDps);
    }
    
    updateUpgradesDisplay() {
        const upgradesList = document.getElementById('upgrades-list');
        upgradesList.innerHTML = '';
        
        this.upgrades.forEach((upgrade, index) => {
            const upgradeDiv = document.createElement('div');
            const canAfford = !upgrade.purchased && this.gold >= upgrade.cost;
            const isUnaffordable = !upgrade.purchased && this.gold < upgrade.cost;
            upgradeDiv.className = `upgrade-card ${upgrade.purchased ? 'purchased' : ''} ${canAfford ? 'affordable' : ''} ${isUnaffordable ? 'unaffordable' : ''}`;
            upgradeDiv.onclick = () => this.purchaseUpgrade(upgrade.id);
            
            upgradeDiv.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost">${upgrade.purchased ? 'OWNED' : this.formatNumber(upgrade.cost) + ' gold'}</div>
            `;
            
            // CSS classes now handle the styling
            
            upgradesList.appendChild(upgradeDiv);
        });
    }
    
    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        
        let unlockedCount = 0;
        
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) unlockedCount++;
            
            const achievementDiv = document.createElement('div');
            achievementDiv.className = `achievement-card ${achievement.unlocked ? 'unlocked' : ''}`;
            
            // Calculate progress for certain achievements
            let progressBar = '';
            if (!achievement.unlocked) {
                let current = 0;
                let target = 0;
                
                // Add progress tracking for numeric achievements
                if (achievement.id === 'gold_1k') {
                    current = this.statistics.totalGoldEarned;
                    target = 1000;
                } else if (achievement.id === 'gold_1m') {
                    current = this.statistics.totalGoldEarned;
                    target = 1000000;
                } else if (achievement.id === 'clicks_100') {
                    current = this.statistics.totalClicks;
                    target = 100;
                } else if (achievement.id === 'clicks_1000') {
                    current = this.statistics.totalClicks;
                    target = 1000;
                } else if (achievement.id === 'monsters_1k') {
                    current = this.monstersKilled;
                    target = 1000;
                } else if (achievement.id === 'damage_1m') {
                    current = this.statistics.totalDamageDealt;
                    target = 1000000;
                }
                
                if (target > 0) {
                    const progress = Math.min((current / target) * 100, 100);
                    progressBar = `
                        <div class="achievement-progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                            <div class="progress-text">${this.formatNumber(current)}/${this.formatNumber(target)}</div>
                        </div>
                    `;
                }
            }
            
            achievementDiv.innerHTML = `
                <div class="achievement-icon">${achievement.unlocked ? achievement.icon : '🔒'}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${progressBar}
            `;
            
            achievementsList.appendChild(achievementDiv);
        });
        
        document.getElementById('achievements-unlocked').textContent = unlockedCount;
        document.getElementById('total-achievements').textContent = this.achievements.length;
    }
    
    updateStatisticsDisplay() {
        const statisticsList = document.getElementById('statistics-list');
        if (!statisticsList) return;
        
        // Calculate current session time
        const currentSessionTime = Date.now() - this.gameStartTime;
        const totalPlayTime = this.statistics.totalPlayTime + currentSessionTime;
        
        // Calculate rates
        const playTimeHours = totalPlayTime / (1000 * 60 * 60);
        const goldPerHour = playTimeHours > 0 ? Math.floor(this.statistics.totalGoldEarned / playTimeHours) : 0;
        const clicksPerMinute = playTimeHours > 0 ? Math.floor(this.statistics.totalClicks / (playTimeHours * 60)) : 0;
        
        const statsData = [
            { icon: '⏱️', label: 'Total Playtime', value: this.formatTime(totalPlayTime), subtext: 'Current session' },
            { icon: '💰', label: 'Gold Per Hour', value: this.formatNumber(goldPerHour), subtext: 'Average rate' },
            { icon: '👆', label: 'Total Clicks', value: this.formatNumber(this.statistics.totalClicks), subtext: `${clicksPerMinute}/min avg` },
            { icon: '💥', label: 'Total Damage', value: this.formatNumber(this.statistics.totalDamageDealt), subtext: 'All time' },
            { icon: '📦', label: 'Treasures Found', value: this.statistics.treasureChestsFound, subtext: `${this.formatNumber(this.statistics.treasureGoldEarned)} gold` },
            { icon: '🏆', label: 'Highest Zone', value: this.statistics.highestZone, subtext: 'Personal best' },
            { icon: '🌟', label: 'Ascensions', value: this.statistics.totalAscensions, subtext: 'Rebirths completed' },
            { icon: '⭐', label: 'Prestige Earned', value: this.statistics.totalPrestigeGained, subtext: 'All time points' }
        ];
        
        statisticsList.innerHTML = '';
        
        statsData.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-card';
            statDiv.innerHTML = `
                <div class="stat-card-icon">${stat.icon}</div>
                <div class="stat-card-label">${stat.label}</div>
                <div class="stat-card-value">${stat.value}</div>
                <div class="stat-card-subtext">${stat.subtext}</div>
            `;
            statisticsList.appendChild(statDiv);
        });
        
        // Update header playtime
        const playtimeElement = document.getElementById('total-playtime');
        if (playtimeElement) {
            playtimeElement.textContent = this.formatTime(totalPlayTime);
        }
    }
    
    updatePrestigeDisplay() {
        const prestigeList = document.getElementById('prestige-list');
        const prestigePointsElement = document.getElementById('prestige-points');
        
        if (prestigePointsElement) {
            prestigePointsElement.textContent = this.prestigePoints;
        }
        
        if (!prestigeList) return;
        
        prestigeList.innerHTML = '';
        
        this.prestigeUpgrades.forEach(upgrade => {
            const cost = upgrade.cost * Math.pow(2, upgrade.level); // Double cost each level
            const canAfford = this.prestigePoints >= cost && upgrade.level < upgrade.maxLevel;
            const isMaxed = upgrade.level >= upgrade.maxLevel;
            
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = `prestige-card ${canAfford ? 'affordable' : ''} ${isMaxed ? 'maxed' : ''}`;
            upgradeDiv.onclick = () => this.purchasePrestigeUpgrade(upgrade.id);
            
            upgradeDiv.innerHTML = `
                <div class="prestige-icon">${upgrade.icon}</div>
                <div class="prestige-name">${upgrade.name}</div>
                <div class="prestige-level">Level ${upgrade.level}/${upgrade.maxLevel}</div>
                <div class="prestige-description">${upgrade.description}</div>
                <div class="prestige-cost">
                    ${isMaxed ? 'MAXED' : `${cost} Prestige Points`}
                </div>
            `;
            
            prestigeList.appendChild(upgradeDiv);
        });
    }
    
    formatTime(milliseconds) {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    updateSkillEffects(now) {
        // Check for expired skills
        Object.keys(this.skillEffects).forEach(skillId => {
            const effect = this.skillEffects[skillId];
            if (effect.active && now >= effect.endTime) {
                effect.active = false;
                this.removeSkillVisualEffect(skillId);
                this.showFloatingText(`${this.activeSkills.find(s => s.id === skillId)?.name} ended`, '#64748B');
            }
        });
    }
    
    updateSkillsDisplay() {
        const skillsGrid = document.getElementById('skills-grid');
        if (!skillsGrid) return;
        
        skillsGrid.innerHTML = '';
        
        this.activeSkills.forEach(skill => {
            const now = Date.now();
            const timeSinceLastUse = now - skill.lastUsed;
            const isUnlocked = this.zone >= skill.unlockZone;
            const isOnCooldown = timeSinceLastUse < skill.cooldown;
            const isActive = this.skillEffects[skill.id].active;
            
            let statusClass = '';
            let statusText = '';
            
            if (!isUnlocked) {
                statusClass = 'locked';
                statusText = `Zone ${skill.unlockZone}`;
            } else if (isActive) {
                statusClass = 'active';
                const timeLeft = Math.ceil((this.skillEffects[skill.id].endTime - now) / 1000);
                statusText = `${timeLeft}s`;
            } else if (isOnCooldown) {
                statusClass = 'on-cooldown';
                const cooldownLeft = Math.ceil((skill.cooldown - timeSinceLastUse) / 1000);
                statusText = `${cooldownLeft}s`;
            } else {
                statusClass = 'ready';
                statusText = 'Ready!';
            }
            
            const skillDiv = document.createElement('div');
            skillDiv.className = `skill-btn ${statusClass}`;
            skillDiv.onclick = () => this.useSkill(skill.id);
            skillDiv.title = skill.description;
            
            skillDiv.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-cooldown">${statusText}</div>
            `;
            
            skillsGrid.appendChild(skillDiv);
        });
    }
    
    formatNumber(num) {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + 'T';
        return (num / 1000000000000000).toFixed(1) + 'Q';
    }
    
    saveGame() {
        const saveData = {
            gold: this.gold,
            clickDamage: this.clickDamage,
            monstersKilled: this.monstersKilled,
            zone: this.zone,
            heroSouls: this.heroSouls,
            totalHeroSouls: this.totalHeroSouls,
            heroes: this.heroes.map(hero => ({
                level: hero.level,
                owned: hero.owned,
                currentCost: hero.currentCost
            })),
            upgrades: this.upgrades.map(upgrade => ({
                id: upgrade.id,
                purchased: upgrade.purchased
            })),
            achievements: this.achievements.map(achievement => ({
                id: achievement.id,
                unlocked: achievement.unlocked,
                dateUnlocked: achievement.dateUnlocked
            })),
            currentMonster: this.currentMonster,
            settings: this.settings,
            statistics: this.statistics,
            treasureChestActive: this.treasureChestActive,
            treasureChestChance: this.treasureChestChance,
            prestigePoints: this.prestigePoints,
            totalPrestigePoints: this.totalPrestigePoints,
            prestigeUpgrades: this.prestigeUpgrades.map(upgrade => ({
                id: upgrade.id,
                level: upgrade.level
            })),
            gameStartTime: this.gameStartTime,
            activeSkills: this.activeSkills.map(skill => ({
                id: skill.id,
                lastUsed: skill.lastUsed,
                timesUsed: skill.timesUsed
            })),
            skillEffects: this.skillEffects,
            equipment: this.equipment,
            inventory: this.inventory,
            dailyChallenges: this.dailyChallenges,
            lastChallengeReset: this.lastChallengeReset
        };
        
        localStorage.setItem('bmtClickerSave', JSON.stringify(saveData));
        this.showFloatingText('Game Saved!', '#4CAF50');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('bmtClickerSave');
        if (!saveData) return;
        
        try {
            const data = JSON.parse(saveData);
            
            this.gold = data.gold || 0;
            this.clickDamage = data.clickDamage || 1;
            this.monstersKilled = data.monstersKilled || 0;
            this.zone = data.zone || 1;
            this.heroSouls = data.heroSouls || 0;
            this.totalHeroSouls = data.totalHeroSouls || 0;
            
            if (data.heroes) {
                data.heroes.forEach((savedHero, index) => {
                    if (this.heroes[index]) {
                        this.heroes[index].level = savedHero.level || 0;
                        this.heroes[index].owned = savedHero.owned || false;
                        this.heroes[index].currentCost = savedHero.currentCost || this.heroes[index].baseCost;
                    }
                });
            }
            
            if (data.upgrades) {
                data.upgrades.forEach(savedUpgrade => {
                    const upgrade = this.upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased || false;
                    }
                });
            }
            
            if (data.achievements) {
                data.achievements.forEach(savedAchievement => {
                    const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.unlocked = savedAchievement.unlocked || false;
                        achievement.dateUnlocked = savedAchievement.dateUnlocked ? new Date(savedAchievement.dateUnlocked) : null;
                    }
                });
            }
            
            if (data.currentMonster) {
                this.currentMonster = data.currentMonster;
            }
            
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
            }
            
            if (data.statistics) {
                this.statistics = { ...this.statistics, ...data.statistics };
            }
            
            this.treasureChestActive = data.treasureChestActive || false;
            this.treasureChestChance = data.treasureChestChance || 0.05;
            this.prestigePoints = data.prestigePoints || 0;
            this.totalPrestigePoints = data.totalPrestigePoints || 0;
            this.gameStartTime = data.gameStartTime || Date.now();
            
            if (data.prestigeUpgrades) {
                data.prestigeUpgrades.forEach(savedUpgrade => {
                    const upgrade = this.prestigeUpgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.level = savedUpgrade.level || 0;
                    }
                });
            }
            
            // Apply prestige effects after loading
            this.applyPrestigeEffects();
            
            if (data.activeSkills) {
                data.activeSkills.forEach(savedSkill => {
                    const skill = this.activeSkills.find(s => s.id === savedSkill.id);
                    if (skill) {
                        skill.lastUsed = savedSkill.lastUsed || 0;
                        skill.timesUsed = savedSkill.timesUsed || 0;
                    }
                });
            }
            
            if (data.skillEffects) {
                this.skillEffects = { ...this.skillEffects, ...data.skillEffects };
                // Ensure expired skills are deactivated on load
                const now = Date.now();
                Object.keys(this.skillEffects).forEach(skillId => {
                    if (this.skillEffects[skillId].active && now >= this.skillEffects[skillId].endTime) {
                        this.skillEffects[skillId].active = false;
                    }
                });
            }
            
            if (data.equipment) {
                this.equipment = { ...this.equipment, ...data.equipment };
            }
            
            if (data.inventory) {
                this.inventory = data.inventory || [];
            }
            
            if (data.dailyChallenges) {
                this.dailyChallenges = data.dailyChallenges || [];
            }
            
            this.lastChallengeReset = data.lastChallengeReset || Date.now();
            
        } catch (e) {
            console.error('Failed to load save data:', e);
        }
    }
}

// Global functions for HTML onclick events
function attackMonster() {
    if (game) game.attackMonster();
}

function ascend() {
    if (game) game.ascend();
}

function openSettingsModal() {
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function closeAscensionModal() {
    document.getElementById('ascension-modal').style.display = 'none';
}

function resetGame() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        try {
            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Close modal
            document.getElementById('settings-modal').style.display = 'none';
            
                // Reset the game object directly instead of relying on page reload
                if (window.game) {
                    // Stop auto-saving during reset
                    window.game.skipLoad = true;
                    
                    // Reset all game properties to initial values
                    window.game.gold = 0;
                window.game.clickDamage = 1;
                window.game.dps = 0;
                window.game.monstersKilled = 0;
                window.game.zone = 1;
                window.game.currentMonster = null;
                window.game.heroSouls = 0;
                window.game.totalHeroSouls = 0;
                window.game.treasureChestActive = false;
                window.game.comboMultiplier = 1;
                window.game.comboCount = 0;
                
                // Reset heroes
                window.game.heroes.forEach(hero => {
                    hero.level = 0;
                    hero.owned = false;
                    hero.currentCost = hero.baseCost;
                });
                
                // Reset upgrades
                window.game.upgrades.forEach(upgrade => {
                    upgrade.purchased = false;
                });
                
                // Reset achievements
                window.game.achievements.forEach(achievement => {
                    achievement.unlocked = false;
                    achievement.dateUnlocked = null;
                });
                
                // Reset statistics
                window.game.statistics = {
                    totalClicks: 0,
                    totalDamageDealt: 0,
                    totalGoldEarned: 0,
                    totalTimePlayed: 0,
                    highestZone: 1,
                    totalAscensions: 0,
                    treasureChestsFound: 0,
                    treasureGoldEarned: 0,
                    totalPlayTime: 0,
                    averageGoldPerHour: 0,
                    averageDPS: 0,
                    fastestZoneTime: 0,
                    totalPrestigeGained: 0
                };
                
                // Reset skills
                window.game.activeSkills.forEach(skill => {
                    skill.lastUsed = 0;
                    skill.timesUsed = 0;
                });
                
                Object.keys(window.game.skillEffects).forEach(skillId => {
                    window.game.skillEffects[skillId].active = false;
                    window.game.skillEffects[skillId].endTime = 0;
                });
                
                // Spawn first monster and update display
                window.game.spawnMonster();
                window.game.updateDisplay();
                
                // Show confirmation
                window.game.showFloatingText('Game Reset Complete!', '#EF4444');
                
                console.log('Game reset completed successfully');
            } else {
                // Fallback to page reload if game object doesn't exist
                console.log('Game object not found, using page reload method');
                window.location.href = window.location.href + '?reset=' + Date.now();
            }
            
        } catch (error) {
            console.error('Error during reset:', error);
            // Last resort - clear storage and force reload
            localStorage.clear();
            window.location.href = window.location.href + '?forceReset=' + Date.now();
        }
    }
}

function saveGame() {
    if (game) game.saveGame();
}

function useSkill(skillId) {
    if (game) game.useSkill(skillId);
}

function forceReset() {
    if (confirm('FORCE RESET: This will completely clear all data and reload the page. Continue?')) {
        try {
            // Nuclear option - clear everything
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear any cookies related to the domain
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            console.log('Force reset: All storage cleared');
            
            // Add cache-busting parameters and reload
            const timestamp = Date.now();
            const newUrl = window.location.href.split('?')[0] + '?forceReset=' + timestamp + '&cache=' + timestamp;
            
            window.location.replace(newUrl);
            
        } catch (error) {
            console.error('Force reset error:', error);
            alert('Force reset failed. Please:\n1. Close this tab\n2. Clear browser cache (Ctrl+Shift+Delete)\n3. Reopen the game');
        }
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new Game();
});

// Save before page unload
window.addEventListener('beforeunload', () => {
    if (game) {
        game.saveGame();
    }
});