// OBS Browser Source Helper Functions

class OBSHelper {
    constructor() {
        this.obsMode = false;
        this.urlParams = new URLSearchParams(window.location.search);
        this.init();
    }

    init() {
        // Check URL parameters for OBS settings
        this.obsMode = this.urlParams.has('obs') || this.urlParams.get('mode') === 'obs';
        
        if (this.obsMode) {
            document.body.classList.add('obs-mode');
            this.applyOBSSettings();
        }
        
        // Add OBS controls if in OBS mode
        if (this.obsMode) {
            this.createOBSControls();
        }
        
        // Listen for OBS events
        this.setupOBSEventListeners();
    }

    applyOBSSettings() {
        // Apply various modes based on URL parameters
        const modes = {
            'compact': 'compact-mode',
            'ultra-compact': 'ultra-compact',
            'chroma': 'chroma-mode',
            'high-contrast': 'high-contrast',
            'performance': 'performance-mode',
            'alert': 'alert-mode',
            'transparent': 'transparent-panels',
            'no-header': 'no-header'
        };

        Object.keys(modes).forEach(param => {
            if (this.urlParams.has(param)) {
                document.body.classList.add(modes[param]);
            }
        });

        // Custom background color
        if (this.urlParams.has('bg')) {
            const bgColor = this.urlParams.get('bg');
            document.body.style.backgroundColor = `#${bgColor}`;
        }

        // Show/hide config panel
        if (this.urlParams.has('config')) {
            document.body.classList.add('show-config');
        }

        // Auto-spin interval
        if (this.urlParams.has('auto-spin')) {
            const interval = parseInt(this.urlParams.get('auto-spin')) * 1000;
            this.startAutoSpin(interval);
        }

        // Custom zoom level
        if (this.urlParams.has('zoom')) {
            const zoom = parseFloat(this.urlParams.get('zoom'));
            document.body.style.zoom = zoom;
        }

        // Hide specific elements
        if (this.urlParams.has('hide')) {
            const hideElements = this.urlParams.get('hide').split(',');
            hideElements.forEach(element => {
                switch(element) {
                    case 'title':
                        document.querySelector('.title')?.style.setProperty('display', 'none');
                        break;
                    case 'subtitle':
                        document.querySelector('.subtitle')?.style.setProperty('display', 'none');
                        break;
                    case 'button':
                        document.querySelector('.spin-button')?.style.setProperty('display', 'none');
                        break;
                    case 'controls':
                        document.querySelector('.obs-controls')?.style.setProperty('display', 'none');
                        break;
                }
            });
        }
    }

    createOBSControls() {
        const controlsHTML = `
            <div class="obs-controls">
                <button class="obs-control-btn" title="Toggle Config" onclick="obsHelper.toggleConfig()">⚙️</button>
                <button class="obs-control-btn" title="Force Spin" onclick="obsHelper.forceSpin()">🎲</button>
                <button class="obs-control-btn" title="Reset" onclick="obsHelper.reset()">🔄</button>
                <button class="obs-control-btn" title="Toggle Transparency" onclick="obsHelper.toggleTransparency()">👁️</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', controlsHTML);
    }

    setupOBSEventListeners() {
        // Listen for custom OBS events via window messages
        window.addEventListener('message', (event) => {
            if (event.data.type === 'obs-command') {
                this.handleOBSCommand(event.data.command, event.data.params);
            }
        });

        // Expose global function for OBS Browser Source interaction
        window.obsBrowserSourceInteract = (command, params) => {
            this.handleOBSCommand(command, params);
        };
    }

    handleOBSCommand(command, params) {
        switch(command) {
            case 'spin':
                this.forceSpin();
                break;
            case 'setOptions':
                this.setOptions(params);
                break;
            case 'showResult':
                this.showCustomResult(params);
                break;
            case 'toggleTheme':
                app?.toggleTheme();
                break;
            case 'reset':
                this.reset();
                break;
            case 'setMode':
                this.setMode(params.mode);
                break;
        }
    }

    toggleConfig() {
        document.body.classList.toggle('show-config');
        app?.toggleConfigPanel();
    }

    forceSpin() {
        // Force a spin even if button is disabled
        const button = document.getElementById('spinButton');
        if (button && !button.disabled) {
            button.click();
        } else if (app) {
            // Override disabled state
            app.spin();
        }
    }

    reset() {
        if (app) {
            app.config.statistics = { totalSpins: 0, optionCounts: {} };
            app.config.history = [];
            app.config.eliminatedOptions = [];
            app.updateStats();
            app.renderHistory();
            app.renderOptions();
            app.roulette.reset();
            app.config.saveToLocalStorage();
        }
    }

    toggleTransparency() {
        document.body.classList.toggle('chroma-mode');
    }

    setOptions(options) {
        if (app && options && Array.isArray(options)) {
            app.config.options = options;
            app.renderOptions();
            app.roulette.draw();
            app.config.saveToLocalStorage();
        }
    }

    showCustomResult(params) {
        if (app && params.result) {
            app.showResultModal(params.result);
        }
    }

    setMode(mode) {
        // Remove all mode classes
        const modeClasses = ['compact-mode', 'ultra-compact', 'chroma-mode', 
                           'high-contrast', 'performance-mode', 'alert-mode', 
                           'transparent-panels', 'no-header'];
        
        modeClasses.forEach(cls => document.body.classList.remove(cls));
        
        // Add new mode
        if (mode && modeClasses.includes(mode)) {
            document.body.classList.add(mode);
        }
    }

    startAutoSpin(interval) {
        setInterval(() => {
            if (!document.getElementById('spinButton').disabled) {
                this.forceSpin();
            }
        }, interval);
    }

    // Method to send data back to OBS
    sendToOBS(data) {
        if (window.obsstudio) {
            window.obsstudio.getCurrentScene((scene) => {
                console.log('Current OBS Scene:', scene);
            });
        }
        
        // Also try to communicate via BroadcastChannel
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('obs-roulette');
            channel.postMessage(data);
        }
    }
}

// Initialize OBS Helper
let obsHelper;
document.addEventListener('DOMContentLoaded', () => {
    obsHelper = new OBSHelper();
});