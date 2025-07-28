// Mock dependencies before requiring App
jest.mock('../js/config');
jest.mock('../js/roulette');
jest.mock('../js/presets');
jest.mock('../js/charts');
jest.mock('../js/twitch');

const App = require('../js/app');
const { Config } = require('../js/config');
const Roulette = require('../js/roulette');
const PresetManager = require('../js/presets');
const ChartManager = require('../js/charts');
const TwitchIntegration = require('../js/twitch');

// Mock DOM elements
const createMockElement = (type = 'div') => {
    const element = document.createElement(type);
    element.addEventListener = jest.fn();
    element.click = jest.fn();
    element.classList = {
        add: jest.fn(),
        remove: jest.fn(),
        toggle: jest.fn(),
        contains: jest.fn()
    };
    element.style = {};
    return element;
};

describe('App', () => {
    let app;
    let mockCanvas;
    let mockRoulette;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Mock URL params
        delete global.location;
        global.location = { search: '' };
        
        // Mock canvas
        mockCanvas = createMockElement('canvas');
        mockCanvas.getContext = jest.fn(() => ({
            clearRect: jest.fn(),
            save: jest.fn(),
            restore: jest.fn()
        }));
        
        // Mock roulette instance
        mockRoulette = {
            draw: jest.fn(),
            spin: jest.fn(),
            reset: jest.fn()
        };
        Roulette.mockImplementation(() => mockRoulette);
        
        // Mock Config
        Config.mockImplementation(() => ({
            options: [
                { text: 'Option 1', weight: 50, color: '#ff0000' },
                { text: 'Option 2', weight: 50, color: '#00ff00' }
            ],
            theme: 'dark',
            soundEnabled: true,
            soundVolume: 0.5,
            tournamentMode: false,
            eliminatedOptions: [],
            statistics: { totalSpins: 0, optionCounts: {} },
            history: [],
            animationConfig: { minSpinTime: 3000, maxSpinTime: 5000 },
            getAvailableOptions: jest.fn(function() { return this.options; }),
            recordSpin: jest.fn(),
            saveToLocalStorage: jest.fn(),
            addOption: jest.fn(),
            removeOption: jest.fn(),
            setTheme: jest.fn(),
            setSoundEnabled: jest.fn()
        }));
        
        // Mock other dependencies
        PresetManager.mockImplementation(() => ({}));
        ChartManager.mockImplementation(() => ({}));
        TwitchIntegration.mockImplementation(() => ({
            connect: jest.fn(),
            disconnect: jest.fn()
        }));
        
        // Setup DOM
        document.body.innerHTML = `
            <canvas id="roulette"></canvas>
            <button id="spinButton">GIRAR</button>
            <button id="addOption">+</button>
            <button id="toggleTheme">🌙</button>
            <button id="toggleSound">🔊</button>
            <button id="toggleTournament">🏆</button>
            <button id="exportConfig">💾</button>
            <button id="importConfig">📁</button>
            <button id="toggleConfig">⚙️</button>
            <button id="closeModal">OK</button>
            <button id="copyOBSUrl">🔗</button>
            <button id="loadPreset">Load</button>
            <button id="savePreset">Save</button>
            <button id="deletePreset">Delete</button>
            <button id="resetStats">Reset</button>
            <button id="toggleHistoryView">History</button>
            <button id="exportHistory">Export</button>
            <button id="twitchConnect">Connect</button>
            <input id="importFile" type="file" />
            <select id="chartType"><option value="pie">Pie</option></select>
            <div id="optionsList"></div>
            <div id="totalSpins">0</div>
            <div id="sessionSpins">0</div>
            <div id="historyList"></div>
            <div id="configPanel" class="config-panel"></div>
            <div id="resultModal" class="modal"></div>
            <div id="resultText"></div>
            <div class="container"></div>
        `;
        
        // Mock getElementById to return our mock elements
        const originalGetElementById = document.getElementById;
        document.getElementById = jest.fn((id) => {
            if (id === 'roulette') return mockCanvas;
            return originalGetElementById.call(document, id);
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            app = new App();
            
            expect(app.config).toBeDefined();
            expect(app.roulette).toBeDefined();
            expect(app.sessionSpins).toBe(0);
            expect(app.currentStreak).toEqual({ option: null, count: 0 });
        });
    });

    describe('init', () => {
        it('should initialize all components', () => {
            app = new App();
            
            expect(Roulette).toHaveBeenCalledWith(mockCanvas, app.config);
            expect(mockRoulette.draw).toHaveBeenCalled();
            expect(PresetManager).toHaveBeenCalled();
            expect(TwitchIntegration).toHaveBeenCalledWith(app);
        });

        it('should parse URL parameters for Twitch', () => {
            global.location.search = '?twitch=test_token';
            
            app = new App();
            
            expect(app.twitchAccessToken).toBe('test_token');
            expect(app.autoHideMode).toBe(true);
        });

        it('should hide roulette in auto-hide mode', () => {
            global.location.search = '?autohide';
            jest.spyOn(App.prototype, 'hideRoulette');
            
            app = new App();
            
            expect(app.hideRoulette).toHaveBeenCalled();
        });

        it('should auto-connect Twitch with token', (done) => {
            global.location.search = '?twitch=test_token';
            
            app = new App();
            
            setTimeout(() => {
                expect(app.twitch.connect).toHaveBeenCalledWith('test_token');
                done();
            }, 1100);
        });
    });

    describe('spin', () => {
        beforeEach(() => {
            app = new App();
            jest.spyOn(app, 'showResultModal').mockImplementation();
            jest.spyOn(window, 'alert').mockImplementation();
        });

        it('should spin the roulette', () => {
            const button = document.getElementById('spinButton');
            const spinCallback = mockRoulette.spin.mock.calls[0]?.[0];
            
            app.spin();
            
            expect(button.disabled).toBe(true);
            expect(mockRoulette.spin).toHaveBeenCalled();
            
            // Simulate spin complete
            if (spinCallback) {
                spinCallback('Option 1');
            }
            
            expect(app.config.recordSpin).toHaveBeenCalledWith('Option 1');
            expect(app.sessionSpins).toBe(1);
            expect(app.showResultModal).toHaveBeenCalledWith('Option 1');
            expect(button.disabled).toBe(false);
        });

        it('should alert when no options available', () => {
            app.config.getAvailableOptions.mockReturnValue([]);
            
            app.spin();
            
            expect(window.alert).toHaveBeenCalledWith('No hay opciones disponibles para girar');
            expect(mockRoulette.spin).not.toHaveBeenCalled();
        });

        it('should handle tournament mode completion', (done) => {
            app.config.tournamentMode = true;
            app.config.getAvailableOptions.mockReturnValue([]);
            
            const spinCallback = mockRoulette.spin.mock.calls[0]?.[0];
            
            app.spin();
            
            if (spinCallback) {
                spinCallback('Last Option');
            }
            
            setTimeout(() => {
                expect(window.alert).toHaveBeenCalledWith('¡Torneo completado! Reiniciando opciones...');
                done();
            }, 2100);
        });
    });

    describe('theme management', () => {
        beforeEach(() => {
            app = new App();
        });

        it('should toggle theme', () => {
            app.config.theme = 'dark';
            
            app.toggleTheme();
            
            expect(app.config.setTheme).toHaveBeenCalled();
            expect(document.body.className).toContain('-theme');
        });

        it('should apply theme on init', () => {
            app.config.theme = 'light';
            
            app.applyTheme();
            
            expect(document.body.classList.add).toHaveBeenCalledWith('light-theme');
        });
    });

    describe('sound management', () => {
        beforeEach(() => {
            app = new App();
        });

        it('should toggle sound', () => {
            const button = document.getElementById('toggleSound');
            app.config.soundEnabled = true;
            
            app.toggleSound();
            
            expect(app.config.setSoundEnabled).toHaveBeenCalledWith(false);
            expect(button.textContent).toBe('🔇');
        });
    });

    describe('hideRoulette and showRouletteAndSpin', () => {
        beforeEach(() => {
            app = new App();
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should hide roulette container', () => {
            const container = document.querySelector('.container');
            
            app.hideRoulette();
            
            expect(container.style.display).toBe('none');
        });

        it('should show roulette and trigger spin', () => {
            const container = document.querySelector('.container');
            jest.spyOn(app, 'spin');
            
            app.showRouletteAndSpin();
            
            expect(container.style.display).toBe('flex');
            expect(container.style.animation).toBe('fadeIn 0.5s ease');
            
            jest.advanceTimersByTime(500);
            
            expect(app.spin).toHaveBeenCalled();
        });

        it('should set hideAfterSpin flag in auto-hide mode', () => {
            app.autoHideMode = true;
            
            app.showRouletteAndSpin();
            
            expect(app.hideAfterSpin).toBe(true);
        });
    });

    describe('keyboard shortcuts', () => {
        beforeEach(() => {
            app = new App();
            jest.spyOn(app, 'spin');
            jest.spyOn(app, 'toggleConfigPanel');
            jest.spyOn(app, 'toggleTheme');
            jest.spyOn(app, 'toggleSound');
            jest.spyOn(app, 'toggleTournament');
        });

        it('should handle spacebar for spin', () => {
            const event = new KeyboardEvent('keydown', { code: 'Space' });
            
            document.dispatchEvent(event);
            
            expect(app.spin).toHaveBeenCalled();
        });

        it('should handle C key for config', () => {
            const event = new KeyboardEvent('keydown', { code: 'KeyC' });
            
            document.dispatchEvent(event);
            
            expect(app.toggleConfigPanel).toHaveBeenCalled();
        });

        it('should not spin when button is disabled', () => {
            document.getElementById('spinButton').disabled = true;
            
            const event = new KeyboardEvent('keydown', { code: 'Space' });
            document.dispatchEvent(event);
            
            expect(app.spin).not.toHaveBeenCalled();
        });
    });
});