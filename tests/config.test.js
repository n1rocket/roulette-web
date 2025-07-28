const { Config, DEFAULT_OPTIONS, THEME_COLORS } = require('../js/config');

describe('Config', () => {
    let config;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        config = new Config();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(config.options).toHaveLength(6);
            expect(config.theme).toBe('dark');
            expect(config.soundEnabled).toBe(true);
            expect(config.soundVolume).toBe(0.5);
            expect(config.tournamentMode).toBe(false);
            expect(config.eliminatedOptions).toEqual([]);
            expect(config.statistics.totalSpins).toBe(0);
            expect(config.history).toEqual([]);
            expect(config.animationConfig.minSpinTime).toBe(3000);
            expect(config.animationConfig.maxSpinTime).toBe(5000);
        });

        it('should load saved configuration from localStorage', () => {
            const savedConfig = {
                options: [{ text: 'Test', weight: 50, color: '#000000' }],
                theme: 'light',
                soundEnabled: false,
                soundVolume: 0.8,
                tournamentMode: true
            };
            localStorage.setItem('rouletteConfig', JSON.stringify(savedConfig));
            
            config = new Config();
            
            expect(config.options).toEqual(savedConfig.options);
            expect(config.theme).toBe('light');
            expect(config.soundEnabled).toBe(false);
            expect(config.soundVolume).toBe(0.8);
            expect(config.tournamentMode).toBe(true);
        });

        it('should handle corrupted localStorage data', () => {
            localStorage.setItem('rouletteConfig', 'invalid JSON');
            
            // Should not throw and use defaults
            expect(() => new Config()).not.toThrow();
            config = new Config();
            expect(config.options).toHaveLength(6);
        });
    });

    describe('saveToLocalStorage', () => {
        it('should save configuration to localStorage', () => {
            config.theme = 'light';
            config.soundVolume = 0.7;
            
            config.saveToLocalStorage();
            
            const saved = JSON.parse(localStorage.getItem('rouletteConfig'));
            expect(saved.theme).toBe('light');
            expect(saved.soundVolume).toBe(0.7);
        });
    });

    describe('exportConfig', () => {
        it('should export configuration as JSON string', () => {
            config.theme = 'light';
            config.soundEnabled = false;
            
            const exported = config.exportConfig();
            const parsed = JSON.parse(exported);
            
            expect(parsed.theme).toBe('light');
            expect(parsed.soundEnabled).toBe(false);
            expect(parsed.options).toEqual(config.options);
        });
    });

    describe('importConfig', () => {
        it('should import valid configuration', () => {
            const importData = {
                options: [{ text: 'Imported', weight: 100, color: '#ff0000' }],
                theme: 'harley',
                soundEnabled: false,
                soundVolume: 0.3,
                tournamentMode: true
            };
            
            const result = config.importConfig(JSON.stringify(importData));
            
            expect(result).toBe(true);
            expect(config.options).toEqual(importData.options);
            expect(config.theme).toBe('harley');
            expect(config.soundEnabled).toBe(false);
            expect(config.soundVolume).toBe(0.3);
            expect(config.tournamentMode).toBe(true);
        });

        it('should reject invalid configuration', () => {
            const result = config.importConfig('invalid JSON');
            expect(result).toBe(false);
        });

        it('should reject configuration without options array', () => {
            const result = config.importConfig(JSON.stringify({ theme: 'dark' }));
            expect(result).toBe(false);
        });
    });

    describe('addOption', () => {
        it('should add new option with correct color', () => {
            const initialLength = config.options.length;
            
            config.addOption('New Option', 25);
            
            expect(config.options).toHaveLength(initialLength + 1);
            expect(config.options[initialLength]).toEqual({
                text: 'New Option',
                weight: 25,
                color: expect.any(String)
            });
        });

        it('should use default weight if not provided', () => {
            config.addOption('Default Weight');
            
            const lastOption = config.options[config.options.length - 1];
            expect(lastOption.weight).toBe(10);
        });

        it('should save to localStorage after adding', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.addOption('Test');
            
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('removeOption', () => {
        it('should remove option at valid index', () => {
            const initialLength = config.options.length;
            
            config.removeOption(0);
            
            expect(config.options).toHaveLength(initialLength - 1);
        });

        it('should not remove option at invalid index', () => {
            const initialLength = config.options.length;
            
            config.removeOption(-1);
            config.removeOption(999);
            
            expect(config.options).toHaveLength(initialLength);
        });

        it('should save to localStorage after removing', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.removeOption(0);
            
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('updateOption', () => {
        it('should update option at valid index', () => {
            config.updateOption(0, { text: 'Updated', weight: 99 });
            
            expect(config.options[0].text).toBe('Updated');
            expect(config.options[0].weight).toBe(99);
        });

        it('should not update option at invalid index', () => {
            const originalOptions = [...config.options];
            
            config.updateOption(-1, { text: 'Invalid' });
            config.updateOption(999, { text: 'Invalid' });
            
            expect(config.options).toEqual(originalOptions);
        });
    });

    describe('recordSpin', () => {
        it('should increment total spins', () => {
            config.recordSpin('Test Result');
            
            expect(config.statistics.totalSpins).toBe(1);
        });

        it('should update option counts', () => {
            config.recordSpin('Test Result');
            config.recordSpin('Test Result');
            
            expect(config.statistics.optionCounts['Test Result']).toBe(2);
        });

        it('should add to history with timestamp', () => {
            config.recordSpin('Test Result');
            
            expect(config.history).toHaveLength(1);
            expect(config.history[0].result).toBe('Test Result');
            expect(config.history[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        });

        it('should limit history to 100 entries', () => {
            for (let i = 0; i < 105; i++) {
                config.recordSpin(`Result ${i}`);
            }
            
            expect(config.history).toHaveLength(100);
            expect(config.history[0].result).toBe('Result 104');
        });

        it('should eliminate option in tournament mode', () => {
            config.tournamentMode = true;
            
            config.recordSpin('Test Result');
            
            expect(config.eliminatedOptions).toContain('Test Result');
        });
    });

    describe('getAvailableOptions', () => {
        it('should return all options when not in tournament mode', () => {
            expect(config.getAvailableOptions()).toEqual(config.options);
        });

        it('should filter eliminated options in tournament mode', () => {
            config.tournamentMode = true;
            config.eliminatedOptions = ['Headshot!', 'Ace'];
            
            const available = config.getAvailableOptions();
            
            expect(available).toHaveLength(4);
            expect(available.some(opt => opt.text === 'Headshot!')).toBe(false);
            expect(available.some(opt => opt.text === 'Ace')).toBe(false);
        });
    });

    describe('resetTournament', () => {
        it('should clear eliminated options', () => {
            config.eliminatedOptions = ['Option1', 'Option2'];
            
            config.resetTournament();
            
            expect(config.eliminatedOptions).toEqual([]);
        });

        it('should save to localStorage', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.resetTournament();
            
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('setTheme', () => {
        it('should update theme and save', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.setTheme('light');
            
            expect(config.theme).toBe('light');
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('setSoundEnabled', () => {
        it('should update sound enabled state and save', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.setSoundEnabled(false);
            
            expect(config.soundEnabled).toBe(false);
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('setSoundVolume', () => {
        it('should clamp volume between 0 and 1', () => {
            config.setSoundVolume(-0.5);
            expect(config.soundVolume).toBe(0);
            
            config.setSoundVolume(1.5);
            expect(config.soundVolume).toBe(1);
            
            config.setSoundVolume(0.7);
            expect(config.soundVolume).toBe(0.7);
        });

        it('should save to localStorage', () => {
            const saveSpy = jest.spyOn(config, 'saveToLocalStorage');
            
            config.setSoundVolume(0.5);
            
            expect(saveSpy).toHaveBeenCalled();
        });
    });
});