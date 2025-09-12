let characterData = { type: null, domain: null, customName: "" };

let playerStats = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    baseHealth: 100,
    baseDamage: 10,
    journal: [],
    achievements: {},
    collectedFragments: 0,
    inventory: {},
    equipmentSlots: { weapon: null, armor: null, trinket: null }
};

let gameState = {
    currentQuestIndex: 0,
    quests: [
        { id: "AWAKENING", type: "writing", title: "A Stranger's Arrival", objective: "Introduce yourself to the Village Elder.", writingPrompt: "The Village Elder studies you. 'Who are you, and why have you come?' Describe your hero (appearance, personality, and a clear goal).", isComplete: false, npc: "Village Elder", rewardXP: 100, prewriteCleared:false },
        { id: "RISING_ACTION", type: "writing", title: "The Spreading Sickness", objective: "Find the Fisherman to learn about the growing blight.", writingPrompt: "The Fisherman points to the horizon. 'It started small,' he says, 'but now... it breathes.' Describe the monstrous slick of pollution using strong doing words and sensory detail.", isComplete: false, npc: "Fisherman", rewardXP: 150, prewriteCleared:false }
    ],
    canInteractWith: null,
    isCombatActive: false
};

export function getCharacterData() {
    return characterData;
}

export function setCharacterData(data) {
    characterData = data;
}

export function getPlayerStats() {
    return playerStats;
}

export function setPlayerStats(stats) {
    playerStats = stats;
}

export function getGameState() {
    return gameState;
}

export function setGameState(state) {
    gameState = state;
}
