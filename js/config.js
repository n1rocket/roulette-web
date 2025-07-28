const DEFAULT_OPTIONS = [
    { text: 'Headshot!', weight: 10, color: '#ff0000' },
    { text: 'Ace', weight: 15, color: '#ff7b00' },
    { text: 'Clutch', weight: 20, color: '#ffff00' },
    { text: 'Eco Round', weight: 25, color: '#00ff00' },
    { text: 'Force Buy', weight: 20, color: '#00ffff' },
    { text: 'Save', weight: 10, color: '#ff00ff' }
];

const THEME_COLORS = {
    dark: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
        text: '#ffffff',
        accent: '#ff1493'
    },
    light: {
        primary: '#f5f5f5',
        secondary: '#ffffff',
        tertiary: '#e0e0e0',
        text: '#0a0a0a',
        accent: '#dc143c'
    },
    harley: {
        primary: '#1a0a1a',
        secondary: '#2a1a2a',
        tertiary: '#3a2a3a',
        text: '#ffffff',
        accent: '#ff1493'
    },
    cs2: {
        primary: '#0a0f1a',
        secondary: '#1a2535',
        tertiary: '#2a3545',
        text: '#ffffff',
        accent: '#ff7b00'
    }
};

const SOUND_SETTINGS = {
    enabled: true,
    volume: 0.5,
    spinSound: 'assets/sounds/spin.mp3',
    winSound: 'assets/sounds/win.mp3'
};

const ANIMATION_CONFIG = {
    minSpinTime: 3000,
    maxSpinTime: 5000,
    acceleration: 0.98,
    minSpeed: 0.5
};

class Config {
    constructor() {
        this.options = [...DEFAULT_OPTIONS];
        this.theme = 'dark';
        this.soundEnabled = true;
        this.soundVolume = 0.5;
        this.tournamentMode = false;
        this.eliminatedOptions = [];
        this.statistics = {
            totalSpins: 0,
            optionCounts: {}
        };
        this.history = [];
        this.animationConfig = {
            minSpinTime: 3000,
            maxSpinTime: 5000
        };
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('rouletteConfig');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    Object.assign(this, data);
                } catch (e) {
                    console.error('Error parsing config:', e);
                    // Clear corrupted data
                    localStorage.removeItem('rouletteConfig');
                }
            }
        } catch (e) {
            console.error('Error accessing localStorage:', e);
            // localStorage might be disabled or full
        }
    }

    saveToLocalStorage() {
        try {
            const data = JSON.stringify(this);
            localStorage.setItem('rouletteConfig', data);
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            // Could be quota exceeded or localStorage disabled
            if (e.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded');
                // Try to clear old data
                try {
                    localStorage.removeItem('rouletteEvents');
                    localStorage.removeItem('streamlabsEvents');
                    // Retry save
                    localStorage.setItem('rouletteConfig', JSON.stringify(this));
                } catch (retryError) {
                    console.error('Failed to save even after cleanup:', retryError);
                }
            }
        }
    }

    exportConfig() {
        const data = {
            options: this.options,
            theme: this.theme,
            soundEnabled: this.soundEnabled,
            soundVolume: this.soundVolume,
            tournamentMode: this.tournamentMode
        };
        return JSON.stringify(data, null, 2);
    }

    importConfig(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.options && Array.isArray(data.options)) {
                this.options = data.options;
                this.theme = data.theme || 'dark';
                this.soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                this.soundVolume = data.soundVolume || 0.5;
                this.tournamentMode = data.tournamentMode || false;
                this.saveToLocalStorage();
                return true;
            }
        } catch (e) {
            console.error('Error importing config:', e);
        }
        return false;
    }

    addOption(text, weight = 10) {
        const colors = ['#ff0000', '#ff7b00', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];
        const color = colors[this.options.length % colors.length];
        this.options.push({ text, weight, color });
        this.saveToLocalStorage();
    }

    removeOption(index) {
        if (index >= 0 && index < this.options.length) {
            this.options.splice(index, 1);
            this.saveToLocalStorage();
        }
    }

    updateOption(index, updates) {
        if (index >= 0 && index < this.options.length) {
            Object.assign(this.options[index], updates);
            this.saveToLocalStorage();
        }
    }

    recordSpin(result) {
        this.statistics.totalSpins++;
        this.statistics.optionCounts[result] = (this.statistics.optionCounts[result] || 0) + 1;
        this.history.unshift({
            result,
            timestamp: new Date().toISOString()
        });
        if (this.history.length > 100) {
            this.history.pop();
        }
        if (this.tournamentMode) {
            this.eliminatedOptions.push(result);
        }
        this.saveToLocalStorage();
    }

    getAvailableOptions() {
        if (!this.tournamentMode) {
            return this.options;
        }
        return this.options.filter(opt => !this.eliminatedOptions.includes(opt.text));
    }

    resetTournament() {
        this.eliminatedOptions = [];
        this.saveToLocalStorage();
    }

    setTheme(theme) {
        this.theme = theme;
        this.saveToLocalStorage();
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.saveToLocalStorage();
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.saveToLocalStorage();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Config, DEFAULT_OPTIONS, THEME_COLORS, SOUND_SETTINGS, ANIMATION_CONFIG };
}