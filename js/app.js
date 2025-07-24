class App {
    constructor() {
        this.config = new Config();
        this.roulette = null;
        this.presetManager = null;
        this.sessionSpins = 0;
        this.currentStreak = { option: null, count: 0 };
        this.init();
    }

    init() {
        const canvas = document.getElementById('roulette');
        this.roulette = new Roulette(canvas, this.config);
        
        // Ensure we have options
        if (this.config.options.length === 0) {
            console.error('No options available!');
        }
        
        this.roulette.draw();

        this.setupEventListeners();
        this.renderOptions();
        this.updateStats();
        this.renderHistory();
        this.applyTheme();
        
        // Initialize preset manager
        this.presetManager = new PresetManager(this.config);
        this.loadCustomPresets();
        
        // Initialize auto-spin
        this.autoSpinInterval = null;
        
        // Initialize chart manager
        const chartCanvas = document.getElementById('historyChart');
        if (chartCanvas) {
            this.chartManager = new ChartManager(chartCanvas, this.config);
        }
        
        // Initialize Streamlabs integration
        this.streamlabs = new StreamlabsIntegration(this);
        
        console.log('App initialized with options:', this.config.options);
    }

    setupEventListeners() {
        document.getElementById('spinButton').addEventListener('click', () => this.spin());
        document.getElementById('addOption').addEventListener('click', () => this.addOption());
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());
        document.getElementById('toggleSound').addEventListener('click', () => this.toggleSound());
        document.getElementById('toggleTournament').addEventListener('click', () => this.toggleTournament());
        document.getElementById('exportConfig').addEventListener('click', () => this.exportConfig());
        document.getElementById('importConfig').addEventListener('click', () => this.importConfig());
        
        const toggleButton = document.getElementById('toggleConfig');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                console.log('Config button clicked');
                this.toggleConfigPanel();
            });
        } else {
            console.error('Toggle config button not found!');
        }
        
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('copyOBSUrl').addEventListener('click', () => this.copyOBSUrl());
        document.getElementById('loadPreset').addEventListener('click', () => this.loadPreset());
        document.getElementById('savePreset').addEventListener('click', () => this.saveCustomPreset());
        document.getElementById('deletePreset').addEventListener('click', () => this.deleteCustomPreset());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStatistics());
        document.getElementById('toggleHistoryView').addEventListener('click', () => this.toggleHistoryView());
        document.getElementById('exportHistory').addEventListener('click', () => this.exportHistory());
        document.getElementById('chartType').addEventListener('change', (e) => this.changeChartType(e.target.value));
        
        // OBS Settings listeners
        this.setupOBSSettingsListeners();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Streamlabs listeners
        this.setupStreamlabsListeners();
        
        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (this.config.importConfig(event.target.result)) {
                        this.renderOptions();
                        this.roulette.draw();
                        alert('Configuración importada correctamente!');
                    } else {
                        alert('Error al importar la configuración');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    spin() {
        const button = document.getElementById('spinButton');
        const options = this.config.getAvailableOptions();
        
        if (options.length === 0) {
            alert('No hay opciones disponibles para girar');
            return;
        }
        
        console.log('Starting spin with options:', options);
        button.disabled = true;
        
        this.roulette.spin((result) => {
            console.log('Spin completed with result:', result);
            
            if (result) {
                this.config.recordSpin(result);
                this.sessionSpins++;
                this.updateStreak(result);
                this.updateStats();
                this.renderHistory();
                
                // Show result modal
                this.showResultModal(result);
                
                if (this.config.tournamentMode && this.config.getAvailableOptions().length === 0) {
                    setTimeout(() => {
                        alert('¡Torneo completado! Reiniciando opciones...');
                        this.config.resetTournament();
                        this.renderOptions();
                        this.roulette.draw();
                    }, 2000);
                }
            }
            
            button.disabled = false;
        });
    }

    addOption() {
        const text = prompt('Nombre de la nueva opción:');
        if (text) {
            const weight = parseInt(prompt('Peso/Probabilidad (1-100):', '10')) || 10;
            this.config.addOption(text, weight);
            this.renderOptions();
            this.roulette.draw();
        }
    }

    renderOptions() {
        const container = document.getElementById('optionsList');
        container.innerHTML = '';
        
        this.config.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.className = 'option-item';
            
            const isEliminated = this.config.tournamentMode && this.config.eliminatedOptions.includes(option.text);
            if (isEliminated) {
                div.style.opacity = '0.5';
            }
            
            div.innerHTML = `
                <input type="text" class="option-input" value="${option.text}" 
                    onchange="app.updateOption(${index}, 'text', this.value)"
                    ${isEliminated ? 'disabled' : ''}>
                <input type="number" class="option-input option-weight" value="${option.weight}" 
                    min="1" max="100"
                    onchange="app.updateOption(${index}, 'weight', parseInt(this.value))"
                    ${isEliminated ? 'disabled' : ''}>
                <button class="remove-button" onclick="app.removeOption(${index})"
                    ${isEliminated ? 'disabled' : ''}>X</button>
            `;
            
            container.appendChild(div);
        });
    }

    updateOption(index, field, value) {
        this.config.updateOption(index, { [field]: value });
        this.roulette.draw();
    }

    removeOption(index) {
        if (confirm('¿Eliminar esta opción?')) {
            this.config.removeOption(index);
            this.renderOptions();
            this.roulette.draw();
        }
    }

    updateStats() {
        // Basic stats
        document.getElementById('totalSpins').textContent = this.config.statistics.totalSpins;
        document.getElementById('sessionSpins').textContent = this.sessionSpins;
        
        // Last result
        const lastResult = this.config.history.length > 0 ? this.config.history[0].result : '-';
        document.getElementById('lastResult').textContent = lastResult;
        
        // Most frequent
        const mostFrequent = this.getMostFrequentOption();
        document.getElementById('mostFrequent').textContent = mostFrequent || '-';
        
        // Current streak
        document.getElementById('currentStreak').textContent = 
            this.currentStreak.count > 1 ? `${this.currentStreak.option} x${this.currentStreak.count}` : '0';
        
        // Detailed stats
        this.renderDetailedStats();
    }
    
    renderDetailedStats() {
        const container = document.getElementById('optionStats');
        container.innerHTML = '';
        
        const totalSpins = this.config.statistics.totalSpins;
        if (totalSpins === 0) {
            container.innerHTML = '<div class="no-stats">No hay estadísticas aún</div>';
            return;
        }
        
        // Calculate stats for each option
        const optionStats = this.config.options.map(option => {
            const count = this.config.statistics.optionCounts[option.text] || 0;
            const percentage = totalSpins > 0 ? (count / totalSpins * 100).toFixed(1) : 0;
            const expectedPercentage = this.calculateExpectedPercentage(option);
            const difference = (percentage - expectedPercentage).toFixed(1);
            
            return {
                text: option.text,
                count: count,
                percentage: percentage,
                expected: expectedPercentage,
                difference: difference,
                color: option.color
            };
        });
        
        // Sort by count descending
        optionStats.sort((a, b) => b.count - a.count);
        
        // Render stats
        optionStats.forEach(stat => {
            const div = document.createElement('div');
            div.className = 'option-stat-item';
            
            const diffClass = stat.difference > 0 ? 'positive' : stat.difference < 0 ? 'negative' : '';
            const diffSymbol = stat.difference > 0 ? '+' : '';
            
            div.innerHTML = `
                <div class="stat-header">
                    <span class="stat-color" style="background-color: ${stat.color}"></span>
                    <span class="stat-name">${stat.text}</span>
                </div>
                <div class="stat-details">
                    <span class="stat-count">${stat.count} veces</span>
                    <span class="stat-percentage">${stat.percentage}%</span>
                    <span class="stat-expected">(esperado: ${stat.expected}%)</span>
                    <span class="stat-diff ${diffClass}">${diffSymbol}${stat.difference}%</span>
                </div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${stat.percentage}%; background-color: ${stat.color}"></div>
                </div>
            `;
            
            container.appendChild(div);
        });
    }
    
    calculateExpectedPercentage(option) {
        const availableOptions = this.config.getAvailableOptions();
        const totalWeight = availableOptions.reduce((sum, opt) => sum + opt.weight, 0);
        return totalWeight > 0 ? (option.weight / totalWeight * 100).toFixed(1) : 0;
    }
    
    getMostFrequentOption() {
        const counts = this.config.statistics.optionCounts;
        let maxCount = 0;
        let mostFrequent = null;
        
        for (const [option, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequent = option;
            }
        }
        
        return mostFrequent;
    }
    
    updateStreak(result) {
        if (this.currentStreak.option === result) {
            this.currentStreak.count++;
        } else {
            this.currentStreak.option = result;
            this.currentStreak.count = 1;
        }
    }
    
    renderDetailedStats() {
        const container = document.getElementById('optionStats');
        container.innerHTML = '';
        
        const totalSpins = this.config.statistics.totalSpins;
        if (totalSpins === 0) return;
        
        // Get all options with their counts
        const optionData = [];
        this.config.options.forEach(option => {
            const count = this.config.statistics.optionCounts[option.text] || 0;
            const percentage = ((count / totalSpins) * 100).toFixed(1);
            const expectedPercentage = this.calculateExpectedPercentage(option.text);
            
            optionData.push({
                name: option.text,
                count: count,
                percentage: percentage,
                expectedPercentage: expectedPercentage
            });
        });
        
        // Sort by count
        optionData.sort((a, b) => b.count - a.count);
        
        // Render
        optionData.forEach(data => {
            const item = document.createElement('div');
            item.className = 'option-stat-item';
            
            const diff = data.percentage - data.expectedPercentage;
            const diffColor = diff > 5 ? '#00ff00' : (diff < -5 ? '#ff0000' : '#ffff00');
            
            item.innerHTML = `
                <span class="option-stat-name">${data.name}</span>
                <span class="option-stat-count">${data.count}</span>
                <span class="option-stat-percentage" style="color: ${diffColor}">${data.percentage}%</span>
            `;
            
            container.appendChild(item);
        });
    }
    
    calculateExpectedPercentage(optionText) {
        const option = this.config.options.find(o => o.text === optionText);
        if (!option) return 0;
        
        const totalWeight = this.config.options.reduce((sum, opt) => sum + opt.weight, 0);
        return ((option.weight / totalWeight) * 100).toFixed(1);
    }
    
    resetStatistics() {
        if (confirm('¿Resetear todas las estadísticas?')) {
            this.config.statistics = { totalSpins: 0, optionCounts: {} };
            this.config.history = [];
            this.sessionSpins = 0;
            this.currentStreak = { option: null, count: 0 };
            this.config.saveToLocalStorage();
            this.updateStats();
            this.renderHistory();
        }
    }

    renderHistory() {
        const container = document.getElementById('history');
        container.innerHTML = '';
        
        this.config.history.slice(0, 10).forEach(entry => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            const date = new Date(entry.timestamp);
            const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            li.innerHTML = `
                <span class="history-result">${entry.result}</span>
                <span class="history-time">${time}</span>
            `;
            
            container.appendChild(li);
        });
    }

    toggleTheme() {
        const themes = ['dark', 'light', 'harley', 'cs2', 'neon', 'retro'];
        const currentIndex = themes.indexOf(this.config.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.config.setTheme(nextTheme);
        this.applyTheme();
    }

    toggleSound() {
        const button = document.getElementById('toggleSound');
        this.config.setSoundEnabled(!this.config.soundEnabled);
        button.textContent = this.config.soundEnabled ? '🔊' : '🔇';
    }

    exportConfig() {
        const data = this.config.exportConfig();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roulette-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importConfig() {
        document.getElementById('importFile').click();
    }

    applyTheme() {
        // Remove all theme classes
        document.body.classList.remove('light-theme', 'dark-theme', 'harley-theme', 'cs2-theme', 'neon-theme', 'retro-theme');
        
        // Apply current theme
        switch(this.config.theme) {
            case 'light':
                document.body.classList.add('light-theme');
                document.getElementById('toggleTheme').textContent = '☀️';
                break;
            case 'harley':
                document.body.classList.add('harley-theme');
                document.getElementById('toggleTheme').textContent = '🃏';
                break;
            case 'cs2':
                document.body.classList.add('cs2-theme');
                document.getElementById('toggleTheme').textContent = '🔫';
                break;
            case 'neon':
                document.body.classList.add('neon-theme');
                document.getElementById('toggleTheme').textContent = '💜';
                break;
            case 'retro':
                document.body.classList.add('retro-theme');
                document.getElementById('toggleTheme').textContent = '🕹️';
                break;
            default:
                document.body.classList.add('dark-theme');
                document.getElementById('toggleTheme').textContent = '🌙';
        }
        
        if (!this.config.soundEnabled) {
            document.getElementById('toggleSound').textContent = '🔇';
        }
        
        if (this.config.tournamentMode) {
            document.getElementById('toggleTournament').classList.add('active');
        }
    }
    
    toggleConfigPanel() {
        const panel = document.getElementById('configPanel');
        const icon = document.querySelector('.toggle-icon');
        
        console.log('Toggle config panel - Current state:', panel.classList.contains('collapsed'));
        
        panel.classList.toggle('collapsed');
        
        if (panel.classList.contains('collapsed')) {
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.style.transform = 'rotate(180deg)';
        }
        
        console.log('Toggle config panel - New state:', panel.classList.contains('collapsed'));
    }
    
    toggleTournament() {
        const button = document.getElementById('toggleTournament');
        this.config.tournamentMode = !this.config.tournamentMode;
        
        if (this.config.tournamentMode) {
            button.classList.add('active');
            this.config.resetTournament();
        } else {
            button.classList.remove('active');
        }
        
        this.renderOptions();
        this.roulette.draw();
        this.config.saveToLocalStorage();
    }
    
    showResultModal(result) {
        const modal = document.getElementById('resultModal');
        const resultText = document.getElementById('resultText');
        
        resultText.textContent = result;
        modal.classList.add('show');
        
        // Add particle effects (skip in performance mode)
        if (typeof particleSystem !== 'undefined' && !document.body.classList.contains('performance-mode')) {
            particleSystem.celebrate();
            
            // Clear particles after 5 seconds
            setTimeout(() => {
                particleSystem.clear();
            }, 5000);
        }
    }
    
    closeModal() {
        const modal = document.getElementById('resultModal');
        modal.classList.remove('show');
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Space or Enter to spin
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                const spinButton = document.getElementById('spinButton');
                if (!spinButton.disabled) {
                    this.spin();
                }
            }
            
            // R to reset stats
            if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                if (confirm('¿Resetear todas las estadísticas?')) {
                    this.resetStatistics();
                }
            }
            
            // C to toggle config panel
            if (e.code === 'KeyC') {
                this.toggleConfigPanel();
            }
            
            // T to toggle theme
            if (e.code === 'KeyT') {
                this.toggleTheme();
            }
            
            // S to toggle sound
            if (e.code === 'KeyS') {
                this.toggleSound();
            }
            
            // M to toggle tournament mode
            if (e.code === 'KeyM') {
                this.toggleTournament();
            }
            
            // Escape to close modal
            if (e.code === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    setupOBSSettingsListeners() {
        const settings = {
            'obsMode': 'obs-mode',
            'compactMode': 'compact-mode',
            'ultraCompactMode': 'ultra-compact',
            'chromaMode': 'chroma-mode',
            'highContrastMode': 'high-contrast',
            'performanceMode': 'performance-mode',
            'alertMode': 'alert-mode',
            'transparentMode': 'transparent-panels',
            'noHeaderMode': 'no-header'
        };
        
        Object.keys(settings).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        document.body.classList.add(settings[id]);
                    } else {
                        document.body.classList.remove(settings[id]);
                    }
                    this.saveOBSSettings();
                });
            }
        });
        
        // Hide button listener
        const hideButton = document.getElementById('hideButton');
        if (hideButton) {
            hideButton.addEventListener('change', (e) => {
                const spinButton = document.getElementById('spinButton');
                if (e.target.checked) {
                    spinButton.style.display = 'none';
                } else {
                    spinButton.style.display = '';
                }
                this.saveOBSSettings();
            });
        }
        
        // Zoom level listener
        const zoomLevel = document.getElementById('zoomLevel');
        const zoomValue = document.getElementById('zoomValue');
        if (zoomLevel) {
            zoomLevel.addEventListener('input', (e) => {
                const zoom = e.target.value;
                document.body.style.zoom = zoom;
                zoomValue.textContent = Math.round(zoom * 100) + '%';
                this.saveOBSSettings();
            });
        }
        
        // Auto-spin listener
        const autoSpinInterval = document.getElementById('autoSpinInterval');
        if (autoSpinInterval) {
            autoSpinInterval.addEventListener('change', (e) => {
                const interval = parseInt(e.target.value);
                this.setAutoSpin(interval);
                this.saveOBSSettings();
            });
        }
        
        // Load saved settings
        this.loadOBSSettings();
    }
    
    saveOBSSettings() {
        const settings = {
            obsMode: document.getElementById('obsMode')?.checked || false,
            compactMode: document.getElementById('compactMode')?.checked || false,
            ultraCompactMode: document.getElementById('ultraCompactMode')?.checked || false,
            chromaMode: document.getElementById('chromaMode')?.checked || false,
            highContrastMode: document.getElementById('highContrastMode')?.checked || false,
            performanceMode: document.getElementById('performanceMode')?.checked || false,
            alertMode: document.getElementById('alertMode')?.checked || false,
            transparentMode: document.getElementById('transparentMode')?.checked || false,
            noHeaderMode: document.getElementById('noHeaderMode')?.checked || false,
            hideButton: document.getElementById('hideButton')?.checked || false,
            zoomLevel: document.getElementById('zoomLevel')?.value || 1,
            autoSpinInterval: document.getElementById('autoSpinInterval')?.value || 0
        };
        
        localStorage.setItem('obsSettings', JSON.stringify(settings));
    }
    
    loadOBSSettings() {
        const saved = localStorage.getItem('obsSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                // Apply settings to checkboxes
                Object.keys(settings).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && element.type === 'checkbox') {
                        element.checked = settings[key];
                        element.dispatchEvent(new Event('change'));
                    } else if (element) {
                        element.value = settings[key];
                        element.dispatchEvent(new Event('input'));
                        element.dispatchEvent(new Event('change'));
                    }
                });
            } catch (e) {
                console.error('Error loading OBS settings:', e);
            }
        }
    }
    
    setAutoSpin(interval) {
        // Clear existing interval
        if (this.autoSpinTimer) {
            clearInterval(this.autoSpinTimer);
            this.autoSpinTimer = null;
        }
        
        // Set new interval if greater than 0
        if (interval > 0) {
            this.autoSpinTimer = setInterval(() => {
                const button = document.getElementById('spinButton');
                if (button && !button.disabled) {
                    this.spin();
                }
            }, interval * 1000);
        }
    }
    
    setAutoSpin(seconds) {
        // Clear existing interval
        if (this.autoSpinInterval) {
            clearInterval(this.autoSpinInterval);
            this.autoSpinInterval = null;
        }
        
        // Set new interval if seconds > 0
        if (seconds > 0) {
            console.log(`Auto-spin enabled: ${seconds} seconds`);
            this.autoSpinInterval = setInterval(() => {
                const button = document.getElementById('spinButton');
                if (button && !button.disabled && !this.roulette.isSpinning) {
                    console.log('Auto-spinning...');
                    this.spin();
                }
            }, seconds * 1000);
        } else {
            console.log('Auto-spin disabled');
        }
    }
    
    setupStreamlabsListeners() {
        const connectButton = document.getElementById('streamlabsConnect');
        const tokenInput = document.getElementById('streamlabsToken');
        
        if (connectButton) {
            connectButton.addEventListener('click', () => {
                if (this.streamlabs.connected) {
                    this.streamlabs.disconnect();
                } else {
                    // Show token input
                    tokenInput.style.display = tokenInput.style.display === 'none' ? 'block' : 'none';
                    if (tokenInput.style.display === 'block') {
                        tokenInput.focus();
                    }
                }
            });
        }
        
        if (tokenInput) {
            tokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && tokenInput.value) {
                    this.streamlabs.connect(tokenInput.value);
                    tokenInput.style.display = 'none';
                    tokenInput.value = '';
                }
            });
        }
        
        // Test buttons
        const testDonation = document.getElementById('testDonation');
        const testSub = document.getElementById('testSubscription');
        
        if (testDonation) {
            testDonation.addEventListener('click', () => this.streamlabs.testDonation());
        }
        
        if (testSub) {
            testSub.addEventListener('click', () => this.streamlabs.testSubscription());
        }
        
        // Trigger settings
        const triggers = ['Donation', 'Subscription', 'Bits', 'Raid'];
        triggers.forEach(trigger => {
            const checkbox = document.getElementById(`trigger${trigger}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const triggerKey = trigger.toLowerCase();
                    this.streamlabs.settings.triggers[triggerKey].enabled = e.target.checked;
                    this.streamlabs.saveSettings();
                });
            }
        });
        
        // Min amount inputs
        const minInputs = {
            'minDonation': 'donation.minAmount',
            'minBits': 'bits.minBits',
            'minRaiders': 'raid.minViewers'
        };
        
        Object.keys(minInputs).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', (e) => {
                    const path = minInputs[inputId].split('.');
                    this.streamlabs.settings.triggers[path[0]][path[1]] = parseInt(e.target.value) || 1;
                    this.streamlabs.saveSettings();
                });
            }
        });
    }
    
    copyOBSUrl() {
        // Build URL with current settings
        const settings = [];
        
        if (document.getElementById('obsMode')?.checked) settings.push('obs');
        if (document.getElementById('compactMode')?.checked) settings.push('compact');
        if (document.getElementById('ultraCompactMode')?.checked) settings.push('ultra-compact');
        if (document.getElementById('chromaMode')?.checked) settings.push('chroma');
        if (document.getElementById('highContrastMode')?.checked) settings.push('high-contrast');
        if (document.getElementById('performanceMode')?.checked) settings.push('performance');
        if (document.getElementById('alertMode')?.checked) settings.push('alert');
        if (document.getElementById('transparentMode')?.checked) settings.push('transparent');
        if (document.getElementById('noHeaderMode')?.checked) settings.push('no-header');
        
        const hideElements = [];
        if (document.getElementById('hideButton')?.checked) hideElements.push('button');
        
        const params = [];
        if (settings.length > 0) {
            settings.forEach(s => params.push(s));
        }
        
        if (hideElements.length > 0) {
            params.push(`hide=${hideElements.join(',')}`);
        }
        
        const zoom = document.getElementById('zoomLevel')?.value;
        if (zoom && zoom !== '1') {
            params.push(`zoom=${zoom}`);
        }
        
        const autoSpin = document.getElementById('autoSpinInterval')?.value;
        if (autoSpin && autoSpin !== '0') {
            params.push(`auto-spin=${autoSpin}`);
        }
        
        const url = window.location.origin + window.location.pathname + 
                   (params.length > 0 ? '?' + params.join('&') : '');
        
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            this.showCopyNotification();
        }).catch(err => {
            console.error('Error copying URL:', err);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyNotification();
        });
    }
    
    showCopyNotification() {
        // Create or get notification element
        let notification = document.querySelector('.copy-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = '¡URL copiada al portapapeles!';
            document.body.appendChild(notification);
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    loadCustomPresets() {
        const customPresets = this.presetManager.getCustomPresets();
        const selectGroup = document.getElementById('customPresetsGroup');
        selectGroup.innerHTML = '';
        
        Object.keys(customPresets).forEach(key => {
            const option = document.createElement('option');
            option.value = `custom_${key}`;
            option.textContent = customPresets[key].name;
            selectGroup.appendChild(option);
        });
    }
    
    saveCustomPreset() {
        const name = prompt('Nombre del preset personalizado:');
        if (!name) return;
        
        const key = name.toLowerCase().replace(/\s+/g, '_');
        const success = this.presetManager.createCustomPreset(name, this.config.options);
        
        if (success) {
            this.loadCustomPresets();
            alert(`Preset "${name}" guardado correctamente!`);
        } else {
            alert('Error al guardar el preset');
        }
    }
    
    deleteCustomPreset() {
        const select = document.getElementById('presetSelect');
        const selectedValue = select.value;
        
        if (!selectedValue.startsWith('custom_')) {
            alert('Selecciona un preset personalizado para eliminar');
            return;
        }
        
        const key = selectedValue.replace('custom_', '');
        const customPresets = this.presetManager.getCustomPresets();
        
        if (customPresets[key]) {
            if (confirm(`¿Eliminar el preset "${customPresets[key].name}"?`)) {
                delete customPresets[key];
                localStorage.setItem('customPresets', JSON.stringify(customPresets));
                this.loadCustomPresets();
                select.value = '';
                alert('Preset eliminado');
            }
        }
    }
    
    loadPreset() {
        const select = document.getElementById('presetSelect');
        const presetName = select.value;
        
        if (!presetName) {
            alert('Por favor selecciona un preset');
            return;
        }
        
        let success = false;
        let presetDisplayName = select.options[select.selectedIndex].text;
        
        // Check if it's a custom preset
        if (presetName.startsWith('custom_')) {
            const key = presetName.replace('custom_', '');
            const customPresets = this.presetManager.getCustomPresets();
            if (customPresets[key]) {
                this.config.options = [...customPresets[key].options];
                this.config.saveToLocalStorage();
                success = true;
            }
        } else {
            // Load built-in preset
            success = this.presetManager.loadPreset(presetName);
        }
        
        if (success) {
            // Update UI
            this.renderOptions();
            this.roulette.draw();
            this.updateStats();
            
            // Show notification
            this.showPresetNotification(`Preset "${presetDisplayName}" cargado`);
            
            // Reset select
            select.value = '';
        } else {
            alert('Error al cargar el preset');
        }
    }
    
    toggleHistoryView() {
        const historyView = document.getElementById('historyView');
        const graphView = document.getElementById('graphView');
        const button = document.getElementById('toggleHistoryView');
        
        if (historyView.style.display === 'none') {
            historyView.style.display = 'block';
            graphView.style.display = 'none';
            button.textContent = '📊 Vista Gráfica';
        } else {
            historyView.style.display = 'none';
            graphView.style.display = 'block';
            button.textContent = '📝 Vista Lista';
            
            if (this.chartManager) {
                this.chartManager.draw(document.getElementById('chartType').value);
            }
        }
    }
    
    changeChartType(type) {
        if (this.chartManager) {
            this.chartManager.draw(type);
        }
    }
    
    exportHistory() {
        const data = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalSpins: this.config.statistics.totalSpins,
                sessionSpins: this.sessionSpins,
                options: this.config.options
            },
            statistics: this.config.statistics,
            history: this.config.history,
            analysis: this.generateAnalysis()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roulette-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    generateAnalysis() {
        const stats = this.config.statistics.optionCounts;
        const total = this.config.statistics.totalSpins;
        
        if (total === 0) return { message: 'No hay datos para analizar' };
        
        const analysis = {
            totalSpins: total,
            sessionSpins: this.sessionSpins,
            optionAnalysis: []
        };
        
        this.config.options.forEach(option => {
            const count = stats[option.text] || 0;
            const actualPercentage = (count / total * 100).toFixed(2);
            const expectedPercentage = this.calculateExpectedPercentage(option);
            const deviation = (actualPercentage - expectedPercentage).toFixed(2);
            
            analysis.optionAnalysis.push({
                option: option.text,
                count: count,
                actualPercentage: parseFloat(actualPercentage),
                expectedPercentage: parseFloat(expectedPercentage),
                deviation: parseFloat(deviation),
                deviationStatus: Math.abs(deviation) < 5 ? 'normal' : Math.abs(deviation) < 10 ? 'moderada' : 'alta'
            });
        });
        
        // Sort by deviation
        analysis.optionAnalysis.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
        
        // Find patterns
        analysis.patterns = this.findPatterns();
        
        return analysis;
    }
    
    findPatterns() {
        const patterns = {
            streaks: [],
            hotOptions: [],
            coldOptions: []
        };
        
        // Find streaks
        let currentStreak = { option: null, count: 0 };
        this.config.history.forEach(entry => {
            if (entry.result === currentStreak.option) {
                currentStreak.count++;
            } else {
                if (currentStreak.count >= 3) {
                    patterns.streaks.push({ ...currentStreak });
                }
                currentStreak = { option: entry.result, count: 1 };
            }
        });
        
        // Find hot and cold options
        const recentHistory = this.config.history.slice(0, 20);
        const recentCounts = {};
        recentHistory.forEach(entry => {
            recentCounts[entry.result] = (recentCounts[entry.result] || 0) + 1;
        });
        
        this.config.options.forEach(option => {
            const recentCount = recentCounts[option.text] || 0;
            const expectedCount = 20 * (option.weight / this.roulette.calculateTotalWeight());
            
            if (recentCount > expectedCount * 1.5) {
                patterns.hotOptions.push(option.text);
            } else if (recentCount < expectedCount * 0.5) {
                patterns.coldOptions.push(option.text);
            }
        });
        
        return patterns;
    }
    
    showPresetNotification(message) {
        let notification = document.querySelector('.preset-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'preset-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-purple);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 600;
            opacity: 1;
            transition: opacity 0.3s;
            z-index: 1001;
        `;
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});