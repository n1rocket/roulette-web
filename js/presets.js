// Preset configurations for different themes and games

const PRESETS = {
    cs2: {
        name: "Counter-Strike 2",
        options: [
            { text: "Headshot!", weight: 10, color: "#ff0000" },
            { text: "Ace", weight: 15, color: "#ff7b00" },
            { text: "Clutch 1v3", weight: 8, color: "#ffff00" },
            { text: "Eco Round", weight: 25, color: "#00ff00" },
            { text: "Force Buy", weight: 20, color: "#00ffff" },
            { text: "Save", weight: 12, color: "#0080ff" },
            { text: "Rush B", weight: 10, color: "#ff00ff" }
        ],
        theme: {
            primary: "#ff7b00",
            secondary: "#1e90ff",
            background: "#0a0f1a"
        }
    },
    
    valorant: {
        name: "Valorant",
        options: [
            { text: "Ace!", weight: 10, color: "#ff4655" },
            { text: "Clutch", weight: 15, color: "#ff7b00" },
            { text: "Thrifty", weight: 12, color: "#ffd700" },
            { text: "Flawless", weight: 8, color: "#00ff88" },
            { text: "Team Ace", weight: 5, color: "#00ffff" },
            { text: "Eco Win", weight: 20, color: "#ff00ff" },
            { text: "Force Buy", weight: 30, color: "#8b00ff" }
        ],
        theme: {
            primary: "#ff4655",
            secondary: "#ff7b00",
            background: "#0f1923"
        }
    },
    
    fortnite: {
        name: "Fortnite",
        options: [
            { text: "Victory Royale!", weight: 5, color: "#ffd700" },
            { text: "Eliminated", weight: 30, color: "#ff0000" },
            { text: "Top 10", weight: 20, color: "#ff7b00" },
            { text: "Legendary Loot", weight: 10, color: "#ff00ff" },
            { text: "Storm Death", weight: 15, color: "#9400d3" },
            { text: "Build Battle", weight: 12, color: "#00ff00" },
            { text: "No Scope", weight: 8, color: "#00ffff" }
        ],
        theme: {
            primary: "#ffd700",
            secondary: "#00ff00",
            background: "#1a1a2e"
        }
    },
    
    apex: {
        name: "Apex Legends",
        options: [
            { text: "Champion!", weight: 8, color: "#ff0000" },
            { text: "Kill Leader", weight: 12, color: "#ff7b00" },
            { text: "Squad Wipe", weight: 10, color: "#ffff00" },
            { text: "Respawned", weight: 25, color: "#00ff00" },
            { text: "Third Party", weight: 20, color: "#00ffff" },
            { text: "Ring Death", weight: 15, color: "#ff00ff" },
            { text: "Kraber Shot", weight: 10, color: "#9400d3" }
        ],
        theme: {
            primary: "#ff0000",
            secondary: "#ff7b00",
            background: "#1a0f0f"
        }
    },
    
    lol: {
        name: "League of Legends",
        options: [
            { text: "Pentakill!", weight: 5, color: "#ffd700" },
            { text: "Baron Steal", weight: 10, color: "#9400d3" },
            { text: "First Blood", weight: 20, color: "#ff0000" },
            { text: "Feeding", weight: 25, color: "#808080" },
            { text: "Carry Game", weight: 15, color: "#00ff00" },
            { text: "Outplayed", weight: 15, color: "#00ffff" },
            { text: "FF 15", weight: 10, color: "#ff00ff" }
        ],
        theme: {
            primary: "#c89b3c",
            secondary: "#0596aa",
            background: "#0a0e1a"
        }
    },
    
    streaming: {
        name: "Streaming",
        options: [
            { text: "New Follower!", weight: 25, color: "#00ff00" },
            { text: "Subscriber!", weight: 15, color: "#9400d3" },
            { text: "Donation!", weight: 10, color: "#ffd700" },
            { text: "Raid!", weight: 8, color: "#ff00ff" },
            { text: "Host!", weight: 12, color: "#00ffff" },
            { text: "Bits!", weight: 20, color: "#ff7b00" },
            { text: "Hype Train!", weight: 10, color: "#ff0000" }
        ],
        theme: {
            primary: "#9146ff",
            secondary: "#00ff00",
            background: "#18181b"
        }
    },
    
    challenges: {
        name: "Retos",
        options: [
            { text: "Push-ups x20", weight: 15, color: "#ff0000" },
            { text: "Agua fría", weight: 10, color: "#00ffff" },
            { text: "Sin manos", weight: 12, color: "#ff7b00" },
            { text: "Cambiar arma", weight: 20, color: "#ffff00" },
            { text: "Solo melee", weight: 8, color: "#ff00ff" },
            { text: "Invertir controles", weight: 15, color: "#00ff00" },
            { text: "Cerrar ojos 10s", weight: 20, color: "#9400d3" }
        ],
        theme: {
            primary: "#ff0000",
            secondary: "#ffff00",
            background: "#1a0a0a"
        }
    },
    
    decisions: {
        name: "Decisiones",
        options: [
            { text: "Sí", weight: 40, color: "#00ff00" },
            { text: "No", weight: 40, color: "#ff0000" },
            { text: "Tal vez", weight: 15, color: "#ffff00" },
            { text: "Pregunta de nuevo", weight: 5, color: "#ff00ff" }
        ],
        theme: {
            primary: "#00ff00",
            secondary: "#ff0000",
            background: "#0a0a0a"
        }
    },
    
    minecraft: {
        name: "Minecraft",
        options: [
            { text: "Creeper!", weight: 20, color: "#00ff00" },
            { text: "Diamantes!", weight: 10, color: "#00ffff" },
            { text: "Lava Death", weight: 25, color: "#ff7b00" },
            { text: "Ender Dragon", weight: 8, color: "#9400d3" },
            { text: "Wither", weight: 12, color: "#333333" },
            { text: "Raid!", weight: 15, color: "#808080" },
            { text: "Netherite!", weight: 10, color: "#4a4a4a" }
        ],
        theme: {
            primary: "#00ff00",
            secondary: "#8b4513",
            background: "#1a1a1a"
        }
    },
    
    gta: {
        name: "GTA Roleplay",
        options: [
            { text: "Policía!", weight: 20, color: "#0080ff" },
            { text: "Robo banco", weight: 15, color: "#00ff00" },
            { text: "Multa", weight: 25, color: "#ff7b00" },
            { text: "Persecución", weight: 20, color: "#ff0000" },
            { text: "Hospital", weight: 10, color: "#ffffff" },
            { text: "Cárcel", weight: 10, color: "#808080" }
        ],
        theme: {
            primary: "#f0b90b",
            secondary: "#00ff00",
            background: "#0a0a0a"
        }
    }
};

class PresetManager {
    constructor(config) {
        this.config = config;
    }

    loadPreset(presetName) {
        const preset = PRESETS[presetName];
        if (!preset) {
            console.error(`Preset ${presetName} not found`);
            return false;
        }

        // Apply options
        this.config.options = [...preset.options];
        
        // Apply theme if specified
        if (preset.theme) {
            this.applyThemeColors(preset.theme);
        }

        // Reset tournament mode
        this.config.eliminatedOptions = [];
        
        // Save changes
        this.config.saveToLocalStorage();
        
        return true;
    }

    applyThemeColors(theme) {
        const root = document.documentElement;
        
        if (theme.primary) {
            root.style.setProperty('--accent-cs-orange', theme.primary);
        }
        
        if (theme.secondary) {
            root.style.setProperty('--accent-cs-blue', theme.secondary);
        }
        
        if (theme.background) {
            root.style.setProperty('--bg-primary', theme.background);
        }
    }

    getPresetList() {
        return Object.keys(PRESETS).map(key => ({
            id: key,
            name: PRESETS[key].name,
            optionCount: PRESETS[key].options.length
        }));
    }

    createCustomPreset(name, options) {
        const customPreset = {
            name: name,
            options: options,
            theme: null
        };
        
        // Save to localStorage
        const customPresets = this.getCustomPresets();
        customPresets[name.toLowerCase().replace(/\s+/g, '_')] = customPreset;
        localStorage.setItem('customPresets', JSON.stringify(customPresets));
        
        return true;
    }

    getCustomPresets() {
        const saved = localStorage.getItem('customPresets');
        return saved ? JSON.parse(saved) : {};
    }

    getAllPresets() {
        const customPresets = this.getCustomPresets();
        return { ...PRESETS, ...customPresets };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresetManager, PRESETS };
}