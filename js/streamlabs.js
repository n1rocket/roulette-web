// Streamlabs integration for the roulette wheel
// Documentation: https://dev.streamlabs.com/

class StreamlabsIntegration {
    constructor(app) {
        this.app = app;
        this.socket = null;
        this.token = null;
        this.socketToken = null;
        this.connected = false;
        this.settings = {
            enabled: false,
            triggers: {
                donation: { enabled: true, minAmount: 5 },
                subscription: { enabled: true },
                follow: { enabled: false },
                bits: { enabled: true, minBits: 100 },
                superchat: { enabled: true, minAmount: 5 },
                host: { enabled: true, minViewers: 10 },
                raid: { enabled: true, minViewers: 10 }
            },
            commands: {
                spin: '!spin',
                options: '!opciones',
                stats: '!stats',
                predict: '!predict'
            },
            pointsSystem: {
                enabled: false,
                costPerSpin: 100,
                winMultiplier: 3
            }
        };
        
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('streamlabsSettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading Streamlabs settings:', e);
            }
        }
    }

    saveSettings() {
        localStorage.setItem('streamlabsSettings', JSON.stringify(this.settings));
    }

    // Connect to Streamlabs Socket API
    async connect(socketToken) {
        if (this.connected) {
            console.log('Already connected to Streamlabs');
            return;
        }

        this.socketToken = socketToken;
        
        // Load Streamlabs Socket.IO library
        if (!window.io) {
            await this.loadSocketIO();
        }

        try {
            // Connect to Streamlabs websocket
            this.socket = io(`https://sockets.streamlabs.com?token=${socketToken}`, {
                transports: ['websocket']
            });

            this.setupEventListeners();
            
        } catch (error) {
            console.error('Error connecting to Streamlabs:', error);
            this.showNotification('Error al conectar con Streamlabs', 'error');
        }
    }

    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to Streamlabs');
            this.connected = true;
            this.showNotification('Conectado a Streamlabs', 'success');
            this.updateUI();
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from Streamlabs');
            this.connected = false;
            this.showNotification('Desconectado de Streamlabs', 'error');
            this.updateUI();
        });

        // Streamlabs events
        this.socket.on('event', (eventData) => {
            console.log('Streamlabs event:', eventData);
            this.handleStreamlabsEvent(eventData);
        });

        // Donation events
        this.socket.on('donation', (data) => {
            this.handleDonation(data);
        });

        // Subscription events
        this.socket.on('subscription', (data) => {
            this.handleSubscription(data);
        });

        // Follow events
        this.socket.on('follow', (data) => {
            this.handleFollow(data);
        });

        // Bits events
        this.socket.on('bits', (data) => {
            this.handleBits(data);
        });

        // Host events
        this.socket.on('host', (data) => {
            this.handleHost(data);
        });

        // Raid events
        this.socket.on('raid', (data) => {
            this.handleRaid(data);
        });
    }

    handleStreamlabsEvent(eventData) {
        if (!eventData.for || eventData.for !== 'streamlabs' || !eventData.type) {
            return;
        }

        // Handle based on event type
        switch (eventData.type) {
            case 'donation':
                if (eventData.message && eventData.message.length > 0) {
                    eventData.message.forEach(donation => this.handleDonation(donation));
                }
                break;
            case 'subscription':
                if (eventData.message && eventData.message.length > 0) {
                    eventData.message.forEach(sub => this.handleSubscription(sub));
                }
                break;
            // Add more event types as needed
        }
    }

    handleDonation(data) {
        console.log('Donation received:', data);
        
        if (!this.settings.triggers.donation.enabled) return;
        
        const amount = parseFloat(data.amount);
        const minAmount = this.settings.triggers.donation.minAmount;
        
        if (amount >= minAmount) {
            this.showNotification(
                `💰 ${data.name} donó $${amount.toFixed(2)}! Girando la ruleta...`,
                'donation'
            );
            
            // Auto spin the wheel
            this.autoSpin({
                type: 'donation',
                user: data.name,
                amount: amount,
                message: data.message
            });
            
            // Check for special commands in message
            if (data.message) {
                this.parseMessage(data.message, data.name, 'donation');
            }
        }
    }

    handleSubscription(data) {
        console.log('Subscription received:', data);
        
        if (!this.settings.triggers.subscription.enabled) return;
        
        const months = data.months || 1;
        const tier = data.sub_plan || '1000';
        
        this.showNotification(
            `🎉 ${data.name} se suscribió (${this.getSubTierName(tier)})! Girando la ruleta...`,
            'subscription'
        );
        
        // Auto spin with bonus for higher tiers
        const spins = tier === '3000' ? 3 : tier === '2000' ? 2 : 1;
        
        for (let i = 0; i < spins; i++) {
            setTimeout(() => {
                this.autoSpin({
                    type: 'subscription',
                    user: data.name,
                    tier: tier,
                    months: months
                });
            }, i * 7000); // 7 second delay between spins
        }
    }

    handleFollow(data) {
        console.log('Follow received:', data);
        
        if (!this.settings.triggers.follow.enabled) return;
        
        this.showNotification(
            `👤 ${data.name} te está siguiendo!`,
            'follow'
        );
    }

    handleBits(data) {
        console.log('Bits received:', data);
        
        if (!this.settings.triggers.bits.enabled) return;
        
        const bits = parseInt(data.amount);
        const minBits = this.settings.triggers.bits.minBits;
        
        if (bits >= minBits) {
            this.showNotification(
                `💎 ${data.name} envió ${bits} bits! Girando la ruleta...`,
                'bits'
            );
            
            this.autoSpin({
                type: 'bits',
                user: data.name,
                amount: bits
            });
        }
    }

    handleHost(data) {
        console.log('Host received:', data);
        
        if (!this.settings.triggers.host.enabled) return;
        
        const viewers = parseInt(data.viewers);
        const minViewers = this.settings.triggers.host.minViewers;
        
        if (viewers >= minViewers) {
            this.showNotification(
                `📺 ${data.name} te está hosteando con ${viewers} viewers! Girando la ruleta...`,
                'host'
            );
            
            this.autoSpin({
                type: 'host',
                user: data.name,
                viewers: viewers
            });
        }
    }

    handleRaid(data) {
        console.log('Raid received:', data);
        
        if (!this.settings.triggers.raid.enabled) return;
        
        const raiders = parseInt(data.raiders);
        const minRaiders = this.settings.triggers.raid.minViewers;
        
        if (raiders >= minRaiders) {
            this.showNotification(
                `⚔️ ${data.name} te está raideando con ${raiders} viewers! Girando la ruleta...`,
                'raid'
            );
            
            // Multiple spins based on raid size
            const spins = Math.min(Math.floor(raiders / 50) + 1, 5);
            
            for (let i = 0; i < spins; i++) {
                setTimeout(() => {
                    this.autoSpin({
                        type: 'raid',
                        user: data.name,
                        raiders: raiders
                    });
                }, i * 7000);
            }
        }
    }

    parseMessage(message, username, type) {
        const lowerMessage = message.toLowerCase();
        const commands = this.settings.commands;
        
        // Check for predict command
        if (lowerMessage.includes(commands.predict)) {
            const prediction = lowerMessage.split(commands.predict)[1].trim();
            if (prediction) {
                this.addPrediction(username, prediction, type);
            }
        }
    }

    addPrediction(username, prediction, type) {
        // Store prediction for later verification
        if (!window.predictions) {
            window.predictions = {};
        }
        
        window.predictions[username] = {
            prediction: prediction,
            type: type,
            timestamp: Date.now()
        };
        
        this.showNotification(
            `🎯 ${username} predice: ${prediction}`,
            'prediction'
        );
    }

    autoSpin(eventData) {
        // Check if spin button is available and not disabled
        const spinButton = document.getElementById('spinButton');
        if (spinButton && !spinButton.disabled && this.app) {
            // Store event data for later use
            this.lastEventData = eventData;
            
            // If in auto-hide mode, show and spin
            if (this.app.autoHideMode) {
                this.app.showRouletteAndSpin();
            } else {
                // Normal spin
                this.app.spin();
            }
            
            // Log the event
            this.logEvent(eventData);
        }
    }

    logEvent(eventData) {
        // Store events for analytics
        let events = JSON.parse(localStorage.getItem('streamlabsEvents') || '[]');
        events.push({
            ...eventData,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events
        if (events.length > 100) {
            events = events.slice(-100);
        }
        
        localStorage.setItem('streamlabsEvents', JSON.stringify(events));
    }

    getSubTierName(tier) {
        switch (tier) {
            case '1000': return 'Tier 1';
            case '2000': return 'Tier 2';
            case '3000': return 'Tier 3';
            case 'Prime': return 'Prime';
            default: return 'Tier 1';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `streamlabs-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Add to notification container
        let container = document.querySelector('.streamlabs-notifications');
        if (!container) {
            container = document.createElement('div');
            container.className = 'streamlabs-notifications';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'donation': return '💰';
            case 'subscription': return '🎉';
            case 'follow': return '👤';
            case 'bits': return '💎';
            case 'host': return '📺';
            case 'raid': return '⚔️';
            case 'success': return '✅';
            case 'error': return '❌';
            case 'prediction': return '🎯';
            default: return 'ℹ️';
        }
    }

    updateUI() {
        const button = document.getElementById('streamlabsConnect');
        if (button) {
            button.textContent = this.connected ? '🟢 Conectado' : '🔴 Conectar';
            button.classList.toggle('connected', this.connected);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
        this.updateUI();
    }

    // Test functions for development
    testDonation() {
        this.handleDonation({
            name: 'TestUser',
            amount: '10.00',
            message: 'Test donation message'
        });
    }

    testSubscription() {
        this.handleSubscription({
            name: 'TestSubscriber',
            months: 1,
            sub_plan: '1000'
        });
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamlabsIntegration;
}