class TwitchIntegration {
    constructor(app) {
        this.app = app;
        this.connected = false;
        this.eventSocket = null;
        this.accessToken = null;
        this.channelId = null;
        this.clientId = 'gp762nuuoqcoxypju8c569th9wz7q5'; // Default Twitch client ID
        
        // Event settings
        this.settings = {
            triggers: {
                subscription: { enabled: true },
                bits: { enabled: true, minBits: 100 },
                raid: { enabled: true, minViewers: 1 },
                follow: { enabled: false },
                giftSub: { enabled: true }
            }
        };
        
        // Load saved settings
        this.loadSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('twitchSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
            } catch (e) {
                console.error('Error loading Twitch settings:', e);
            }
        }
    }
    
    saveSettings() {
        localStorage.setItem('twitchSettings', JSON.stringify(this.settings));
    }
    
    async connect(accessToken = null) {
        if (accessToken) {
            this.accessToken = accessToken;
            localStorage.setItem('twitchAccessToken', accessToken);
        } else {
            this.accessToken = localStorage.getItem('twitchAccessToken');
        }
        
        if (!this.accessToken) {
            console.error('No access token provided');
            return false;
        }
        
        try {
            // Validate token and get channel info
            const validation = await this.validateToken();
            if (!validation) {
                console.error('Invalid token');
                return false;
            }
            
            this.channelId = validation.user_id;
            
            // Connect to EventSub WebSocket
            await this.connectEventSub();
            
            this.connected = true;
            this.updateUI();
            
            console.log('Connected to Twitch as:', validation.login);
            return true;
            
        } catch (error) {
            console.error('Error connecting to Twitch:', error);
            this.disconnect();
            return false;
        }
    }
    
    async validateToken() {
        try {
            const response = await fetch('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error validating token:', error);
            return null;
        }
    }
    
    async connectEventSub() {
        // Connect to Twitch EventSub WebSocket
        this.eventSocket = new WebSocket('wss://eventsub.wss.twitch.tv/ws');
        
        this.eventSocket.onopen = () => {
            console.log('Connected to Twitch EventSub WebSocket');
        };
        
        this.eventSocket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            
            switch (message.metadata.message_type) {
                case 'session_welcome':
                    // Subscribe to events
                    await this.subscribeToEvents(message.payload.session.id);
                    break;
                    
                case 'notification':
                    this.handleEvent(message.payload);
                    break;
                    
                case 'session_keepalive':
                    // Keep connection alive
                    break;
            }
        };
        
        this.eventSocket.onerror = (error) => {
            console.error('EventSub WebSocket error:', error);
        };
        
        this.eventSocket.onclose = () => {
            console.log('EventSub WebSocket closed');
            this.connected = false;
            this.updateUI();
            
            // Attempt to reconnect after 5 seconds
            if (this.accessToken) {
                setTimeout(() => this.connect(), 5000);
            }
        };
    }
    
    async subscribeToEvents(sessionId) {
        const subscriptions = [
            {
                type: 'channel.subscribe',
                version: '1',
                condition: { broadcaster_user_id: this.channelId }
            },
            {
                type: 'channel.subscription.gift',
                version: '1',
                condition: { broadcaster_user_id: this.channelId }
            },
            {
                type: 'channel.cheer',
                version: '1',
                condition: { broadcaster_user_id: this.channelId }
            },
            {
                type: 'channel.raid',
                version: '1',
                condition: { to_broadcaster_user_id: this.channelId }
            },
            {
                type: 'channel.follow',
                version: '2',
                condition: { 
                    broadcaster_user_id: this.channelId,
                    moderator_user_id: this.channelId
                }
            }
        ];
        
        for (const sub of subscriptions) {
            try {
                await this.createSubscription(sub, sessionId);
            } catch (error) {
                console.error(`Error subscribing to ${sub.type}:`, error);
            }
        }
    }
    
    async createSubscription(subscription, sessionId) {
        const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Client-Id': this.clientId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...subscription,
                transport: {
                    method: 'websocket',
                    session_id: sessionId
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create subscription: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    handleEvent(payload) {
        const { subscription, event } = payload;
        
        console.log('Twitch event received:', subscription.type, event);
        
        switch (subscription.type) {
            case 'channel.subscribe':
                this.handleSubscription(event);
                break;
                
            case 'channel.subscription.gift':
                this.handleGiftSub(event);
                break;
                
            case 'channel.cheer':
                this.handleCheer(event);
                break;
                
            case 'channel.raid':
                this.handleRaid(event);
                break;
                
            case 'channel.follow':
                this.handleFollow(event);
                break;
        }
    }
    
    handleSubscription(data) {
        if (!this.settings.triggers.subscription.enabled) return;
        
        const tierMap = {
            '1000': 1,
            '2000': 2,
            '3000': 3
        };
        
        const tier = tierMap[data.tier] || 1;
        const isResub = data.is_gift === false && data.cumulative_months > 1;
        
        this.showNotification(
            `🎉 ${data.user_name} ${isResub ? 're-subscribed' : 'subscribed'} (Tier ${tier})! Spinning...`,
            'subscription'
        );
        
        // Spin based on tier
        for (let i = 0; i < tier; i++) {
            setTimeout(() => {
                this.autoSpin({
                    type: 'subscription',
                    user: data.user_name,
                    tier: tier,
                    months: data.cumulative_months
                });
            }, i * 7000);
        }
    }
    
    handleGiftSub(data) {
        if (!this.settings.triggers.giftSub.enabled) return;
        
        const total = data.total;
        const tier = data.tier === '1000' ? 1 : data.tier === '2000' ? 2 : 3;
        
        this.showNotification(
            `🎁 ${data.user_name} gifted ${total} Tier ${tier} subs! Spinning...`,
            'gift'
        );
        
        // Spin once for every 5 gift subs (max 3 spins)
        const spins = Math.min(Math.ceil(total / 5), 3);
        for (let i = 0; i < spins; i++) {
            setTimeout(() => {
                this.autoSpin({
                    type: 'giftsub',
                    user: data.user_name,
                    total: total,
                    tier: tier
                });
            }, i * 7000);
        }
    }
    
    handleCheer(data) {
        if (!this.settings.triggers.bits.enabled) return;
        
        const bits = data.bits;
        if (bits < this.settings.triggers.bits.minBits) return;
        
        this.showNotification(
            `💎 ${data.user_name} cheered ${bits} bits! Spinning...`,
            'bits'
        );
        
        this.autoSpin({
            type: 'bits',
            user: data.user_name,
            amount: bits
        });
    }
    
    handleRaid(data) {
        if (!this.settings.triggers.raid.enabled) return;
        
        const viewers = data.viewers;
        if (viewers < this.settings.triggers.raid.minViewers) return;
        
        this.showNotification(
            `⚔️ ${data.from_broadcaster_user_name} raided with ${viewers} viewers! Spinning...`,
            'raid'
        );
        
        // Multiple spins for large raids
        const spins = viewers >= 100 ? 3 : viewers >= 50 ? 2 : 1;
        for (let i = 0; i < spins; i++) {
            setTimeout(() => {
                this.autoSpin({
                    type: 'raid',
                    user: data.from_broadcaster_user_name,
                    viewers: viewers
                });
            }, i * 7000);
        }
    }
    
    handleFollow(data) {
        if (!this.settings.triggers.follow.enabled) return;
        
        this.showNotification(
            `👤 ${data.user_name} followed!`,
            'follow'
        );
    }
    
    autoSpin(eventData) {
        const spinButton = document.getElementById('spinButton');
        if (spinButton && !spinButton.disabled && this.app) {
            this.lastEventData = eventData;
            
            // If in auto-hide mode, show and spin
            if (this.app.autoHideMode) {
                this.app.showRouletteAndSpin();
            } else {
                // Normal spin
                this.app.spin();
            }
            
            this.logEvent(eventData);
        }
    }
    
    showNotification(message, type) {
        if (!document.querySelector('.twitch-notifications')) {
            const container = document.createElement('div');
            container.className = 'twitch-notifications';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `twitch-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getIcon(type)}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        const container = document.querySelector('.twitch-notifications');
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    getIcon(type) {
        const icons = {
            subscription: '🎉',
            gift: '🎁',
            bits: '💎',
            raid: '⚔️',
            follow: '👤'
        };
        return icons[type] || '📢';
    }
    
    logEvent(eventData) {
        let events = JSON.parse(localStorage.getItem('twitchEvents') || '[]');
        events.push({
            ...eventData,
            timestamp: new Date().toISOString()
        });
        
        if (events.length > 100) {
            events = events.slice(-100);
        }
        
        localStorage.setItem('twitchEvents', JSON.stringify(events));
    }
    
    disconnect() {
        if (this.eventSocket) {
            this.eventSocket.close();
            this.eventSocket = null;
        }
        
        this.connected = false;
        this.accessToken = null;
        this.channelId = null;
        
        localStorage.removeItem('twitchAccessToken');
        
        this.updateUI();
    }
    
    updateUI() {
        const connectButton = document.getElementById('twitchConnect');
        const statusText = document.querySelector('.twitch-status');
        
        if (connectButton) {
            connectButton.textContent = this.connected ? '🟢 Conectado' : '🔴 Conectar';
            connectButton.classList.toggle('connected', this.connected);
        }
        
        if (statusText) {
            statusText.textContent = this.connected ? 'Conectado a Twitch' : 'Desconectado';
        }
    }
    
    // Test functions for development
    testSubscription() {
        this.handleSubscription({
            user_name: 'TestUser',
            tier: '1000',
            is_gift: false,
            cumulative_months: 3
        });
    }
    
    testBits() {
        this.handleCheer({
            user_name: 'TestUser',
            bits: 500
        });
    }
    
    testRaid() {
        this.handleRaid({
            from_broadcaster_user_name: 'TestRaider',
            viewers: 150
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TwitchIntegration;
}