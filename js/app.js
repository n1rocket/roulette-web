class App {
    constructor() {
        this.config = new Config();
        this.roulette = null;
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
        document.getElementById('toggleConfig').addEventListener('click', () => this.toggleConfigPanel());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        
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
        document.getElementById('totalSpins').textContent = this.config.statistics.totalSpins;
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
        const body = document.body;
        const button = document.getElementById('toggleTheme');
        
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            button.textContent = '🌙';
            this.config.setTheme('dark');
        } else {
            body.classList.add('light-theme');
            button.textContent = '☀️';
            this.config.setTheme('light');
        }
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
        if (this.config.theme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('toggleTheme').textContent = '☀️';
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
        
        panel.classList.toggle('collapsed');
        
        if (panel.classList.contains('collapsed')) {
            icon.style.transform = 'rotate(0deg)';
        } else {
            icon.style.transform = 'rotate(180deg)';
        }
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
        
        // Add some confetti or special effects here if desired
        if (this.config.soundEnabled) {
            // Play win sound is already handled in roulette.js
        }
    }
    
    closeModal() {
        const modal = document.getElementById('resultModal');
        modal.classList.remove('show');
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});