const TwitchIntegration = require('../js/twitch');

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 1;
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
        MockWebSocket.instance = this;
    }
    
    close() {
        this.readyState = 3;
        if (this.onclose) {
            this.onclose();
        }
    }
    
    static triggerMessage(data) {
        if (MockWebSocket.instance && MockWebSocket.instance.onmessage) {
            MockWebSocket.instance.onmessage({ data: JSON.stringify(data) });
        }
    }
}

// Mock fetch
global.fetch = jest.fn();
global.WebSocket = MockWebSocket;

describe('TwitchIntegration', () => {
    let twitch;
    let mockApp;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        MockWebSocket.instance = null;
        localStorage.clear();
        
        // Mock app
        mockApp = {
            spin: jest.fn(),
            showRouletteAndSpin: jest.fn(),
            autoHideMode: false
        };
        
        // Create twitch instance
        twitch = new TwitchIntegration(mockApp);
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(twitch.app).toBe(mockApp);
            expect(twitch.connected).toBe(false);
            expect(twitch.eventSocket).toBeNull();
            expect(twitch.accessToken).toBeNull();
            expect(twitch.channelId).toBeNull();
            expect(twitch.clientId).toBe('gp762nuuoqcoxypju8c569th9wz7q5');
        });

        it('should load saved settings from localStorage', () => {
            const savedSettings = {
                triggers: {
                    subscription: { enabled: false },
                    bits: { enabled: true, minBits: 500 }
                }
            };
            localStorage.setItem('twitchSettings', JSON.stringify(savedSettings));
            
            twitch = new TwitchIntegration(mockApp);
            
            expect(twitch.settings.triggers.subscription.enabled).toBe(false);
            expect(twitch.settings.triggers.bits.minBits).toBe(500);
        });
    });

    describe('saveSettings', () => {
        it('should save settings to localStorage', () => {
            twitch.settings.triggers.bits.minBits = 200;
            twitch.saveSettings();
            
            const saved = JSON.parse(localStorage.getItem('twitchSettings'));
            expect(saved.triggers.bits.minBits).toBe(200);
        });
    });

    describe('connect', () => {
        beforeEach(() => {
            jest.spyOn(twitch, 'validateToken');
            jest.spyOn(twitch, 'connectEventSub');
        });

        it('should connect with provided access token', async () => {
            twitch.validateToken.mockResolvedValue({ user_id: '123', login: 'testuser' });
            twitch.connectEventSub.mockResolvedValue();
            
            const result = await twitch.connect('test_token');
            
            expect(twitch.accessToken).toBe('test_token');
            expect(localStorage.getItem('twitchAccessToken')).toBe('test_token');
            expect(twitch.channelId).toBe('123');
            expect(twitch.connected).toBe(true);
            expect(result).toBe(true);
        });

        it('should connect with saved token', async () => {
            localStorage.setItem('twitchAccessToken', 'saved_token');
            twitch.validateToken.mockResolvedValue({ user_id: '456', login: 'saveduser' });
            twitch.connectEventSub.mockResolvedValue();
            
            const result = await twitch.connect();
            
            expect(twitch.accessToken).toBe('saved_token');
            expect(result).toBe(true);
        });

        it('should fail without token', async () => {
            const result = await twitch.connect();
            
            expect(result).toBe(false);
            expect(twitch.connected).toBe(false);
        });

        it('should fail with invalid token', async () => {
            twitch.validateToken.mockResolvedValue(null);
            
            const result = await twitch.connect('invalid_token');
            
            expect(result).toBe(false);
            expect(twitch.connected).toBe(false);
        });
    });

    describe('validateToken', () => {
        it('should validate token successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ user_id: '123', login: 'testuser' })
            });
            
            twitch.accessToken = 'test_token';
            const result = await twitch.validateToken();
            
            expect(fetch).toHaveBeenCalledWith('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': 'Bearer test_token'
                }
            });
            expect(result).toEqual({ user_id: '123', login: 'testuser' });
        });

        it('should return null for invalid token', async () => {
            fetch.mockResolvedValueOnce({
                ok: false
            });
            
            twitch.accessToken = 'invalid_token';
            const result = await twitch.validateToken();
            
            expect(result).toBeNull();
        });
    });

    describe('connectEventSub', () => {
        it('should create WebSocket connection', async () => {
            await twitch.connectEventSub();
            
            expect(twitch.eventSocket).toBeInstanceOf(MockWebSocket);
            expect(twitch.eventSocket.url).toBe('wss://eventsub.wss.twitch.tv/ws');
        });

        it('should handle session welcome message', async () => {
            jest.spyOn(twitch, 'subscribeToEvents').mockResolvedValue();
            
            await twitch.connectEventSub();
            
            MockWebSocket.triggerMessage({
                metadata: { message_type: 'session_welcome' },
                payload: { session: { id: 'session123' } }
            });
            
            expect(twitch.subscribeToEvents).toHaveBeenCalledWith('session123');
        });

        it('should handle notification message', async () => {
            jest.spyOn(twitch, 'handleEvent');
            
            await twitch.connectEventSub();
            
            const payload = { subscription: { type: 'channel.subscribe' }, event: {} };
            MockWebSocket.triggerMessage({
                metadata: { message_type: 'notification' },
                payload
            });
            
            expect(twitch.handleEvent).toHaveBeenCalledWith(payload);
        });

        it('should handle connection close and reconnect', async () => {
            jest.useFakeTimers();
            jest.spyOn(twitch, 'connect');
            
            twitch.accessToken = 'test_token';
            await twitch.connectEventSub();
            
            // Trigger close
            twitch.eventSocket.close();
            
            expect(twitch.connected).toBe(false);
            
            // Fast forward timer
            jest.advanceTimersByTime(5000);
            
            expect(twitch.connect).toHaveBeenCalled();
            
            jest.useRealTimers();
        });
    });

    describe('event handlers', () => {
        beforeEach(() => {
            jest.spyOn(twitch, 'showNotification');
            jest.spyOn(twitch, 'autoSpin');
        });

        describe('handleSubscription', () => {
            it('should handle subscription event', () => {
                twitch.handleSubscription({
                    user_name: 'TestUser',
                    tier: '1000',
                    is_gift: false,
                    cumulative_months: 1
                });
                
                expect(twitch.showNotification).toHaveBeenCalledWith(
                    expect.stringContaining('TestUser subscribed'),
                    'subscription'
                );
                expect(twitch.autoSpin).toHaveBeenCalled();
            });

            it('should handle resub', () => {
                twitch.handleSubscription({
                    user_name: 'TestUser',
                    tier: '1000',
                    is_gift: false,
                    cumulative_months: 3
                });
                
                expect(twitch.showNotification).toHaveBeenCalledWith(
                    expect.stringContaining('re-subscribed'),
                    'subscription'
                );
            });

            it('should spin multiple times for higher tiers', () => {
                jest.useFakeTimers();
                
                twitch.handleSubscription({
                    user_name: 'TestUser',
                    tier: '3000',
                    is_gift: false,
                    cumulative_months: 1
                });
                
                jest.runAllTimers();
                
                expect(twitch.autoSpin).toHaveBeenCalledTimes(3);
                
                jest.useRealTimers();
            });

            it('should not spin if disabled', () => {
                twitch.settings.triggers.subscription.enabled = false;
                
                twitch.handleSubscription({
                    user_name: 'TestUser',
                    tier: '1000'
                });
                
                expect(twitch.autoSpin).not.toHaveBeenCalled();
            });
        });

        describe('handleCheer', () => {
            it('should handle bits event above minimum', () => {
                twitch.settings.triggers.bits.minBits = 100;
                
                twitch.handleCheer({
                    user_name: 'TestUser',
                    bits: 500
                });
                
                expect(twitch.showNotification).toHaveBeenCalledWith(
                    expect.stringContaining('500 bits'),
                    'bits'
                );
                expect(twitch.autoSpin).toHaveBeenCalled();
            });

            it('should ignore bits below minimum', () => {
                twitch.settings.triggers.bits.minBits = 100;
                
                twitch.handleCheer({
                    user_name: 'TestUser',
                    bits: 50
                });
                
                expect(twitch.autoSpin).not.toHaveBeenCalled();
            });
        });

        describe('handleRaid', () => {
            it('should handle raid event', () => {
                twitch.handleRaid({
                    from_broadcaster_user_name: 'Raider',
                    viewers: 50
                });
                
                expect(twitch.showNotification).toHaveBeenCalledWith(
                    expect.stringContaining('raided with 50 viewers'),
                    'raid'
                );
                expect(twitch.autoSpin).toHaveBeenCalled();
            });

            it('should spin multiple times for large raids', () => {
                jest.useFakeTimers();
                
                twitch.handleRaid({
                    from_broadcaster_user_name: 'BigRaider',
                    viewers: 150
                });
                
                jest.runAllTimers();
                
                expect(twitch.autoSpin).toHaveBeenCalledTimes(3);
                
                jest.useRealTimers();
            });
        });
    });

    describe('autoSpin', () => {
        let mockSpinButton;

        beforeEach(() => {
            mockSpinButton = {
                disabled: false
            };
            document.getElementById = jest.fn((id) => {
                if (id === 'spinButton') return mockSpinButton;
                return null;
            });
        });

        it('should trigger normal spin', () => {
            twitch.autoSpin({ type: 'test' });
            
            expect(mockApp.spin).toHaveBeenCalled();
        });

        it('should trigger showRouletteAndSpin in auto-hide mode', () => {
            mockApp.autoHideMode = true;
            
            twitch.autoSpin({ type: 'test' });
            
            expect(mockApp.showRouletteAndSpin).toHaveBeenCalled();
            expect(mockApp.spin).not.toHaveBeenCalled();
        });

        it('should not spin if button is disabled', () => {
            mockSpinButton.disabled = true;
            
            twitch.autoSpin({ type: 'test' });
            
            expect(mockApp.spin).not.toHaveBeenCalled();
        });

        it('should log event', () => {
            jest.spyOn(twitch, 'logEvent');
            
            twitch.autoSpin({ type: 'test' });
            
            expect(twitch.logEvent).toHaveBeenCalledWith({ type: 'test' });
        });
    });

    describe('disconnect', () => {
        it('should close WebSocket and clear data', async () => {
            // Setup connected state
            twitch.accessToken = 'test_token';
            twitch.channelId = '123';
            twitch.connected = true;
            await twitch.connectEventSub();
            
            const closeSpy = jest.spyOn(twitch.eventSocket, 'close');
            
            twitch.disconnect();
            
            expect(closeSpy).toHaveBeenCalled();
            expect(twitch.eventSocket).toBeNull();
            expect(twitch.connected).toBe(false);
            expect(twitch.accessToken).toBeNull();
            expect(twitch.channelId).toBeNull();
            expect(localStorage.getItem('twitchAccessToken')).toBeNull();
        });
    });

    describe('updateUI', () => {
        let mockButton;
        let mockStatus;

        beforeEach(() => {
            mockButton = {
                textContent: '',
                classList: {
                    toggle: jest.fn()
                }
            };
            mockStatus = {
                textContent: ''
            };
            
            document.getElementById = jest.fn((id) => {
                if (id === 'twitchConnect') return mockButton;
                return null;
            });
            
            document.querySelector = jest.fn((selector) => {
                if (selector === '.twitch-status') return mockStatus;
                return null;
            });
        });

        it('should update UI when connected', () => {
            twitch.connected = true;
            twitch.updateUI();
            
            expect(mockButton.textContent).toBe('🟢 Conectado');
            expect(mockButton.classList.toggle).toHaveBeenCalledWith('connected', true);
            expect(mockStatus.textContent).toBe('Conectado a Twitch');
        });

        it('should update UI when disconnected', () => {
            twitch.connected = false;
            twitch.updateUI();
            
            expect(mockButton.textContent).toBe('🔴 Conectar');
            expect(mockButton.classList.toggle).toHaveBeenCalledWith('connected', false);
            expect(mockStatus.textContent).toBe('Desconectado');
        });
    });
});