const Roulette = require('../js/roulette');
const { Config } = require('../js/config');

// Mock canvas context
const createMockContext = () => ({
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    shadowColor: '',
    shadowBlur: 0,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low'
});

describe('Roulette', () => {
    let canvas;
    let ctx;
    let config;
    let roulette;

    beforeEach(() => {
        // Setup mock canvas
        ctx = createMockContext();
        canvas = {
            width: 500,
            height: 500,
            getContext: jest.fn(() => ctx)
        };

        // Setup config
        config = new Config();
        
        // Create roulette instance
        roulette = new Roulette(canvas, config);
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(roulette.canvas).toBe(canvas);
            expect(roulette.ctx).toBe(ctx);
            expect(roulette.config).toBe(config);
            expect(roulette.rotation).toBe(0);
            expect(roulette.isSpinning).toBe(false);
            expect(roulette.currentSpeed).toBe(0);
            expect(roulette.targetRotation).toBe(0);
            expect(roulette.selectedResult).toBeNull();
            expect(roulette.animationStartTime).toBe(0);
            expect(roulette.animationDuration).toBe(0);
            expect(roulette.startRotation).toBe(0);
        });

        it('should set canvas context optimization settings', () => {
            expect(ctx.imageSmoothingEnabled).toBe(true);
            expect(ctx.imageSmoothingQuality).toBe('low');
        });
    });

    describe('calculateTotalWeight', () => {
        it('should calculate sum of all option weights', () => {
            config.options = [
                { text: 'A', weight: 10, color: '#000' },
                { text: 'B', weight: 20, color: '#000' },
                { text: 'C', weight: 30, color: '#000' }
            ];

            expect(roulette.calculateTotalWeight()).toBe(60);
        });

        it('should return 0 for empty options', () => {
            config.options = [];
            expect(roulette.calculateTotalWeight()).toBe(0);
        });
    });

    describe('getSegmentAngle', () => {
        it('should calculate correct segment angle', () => {
            config.options = [
                { text: 'A', weight: 10, color: '#000' },
                { text: 'B', weight: 10, color: '#000' },
                { text: 'C', weight: 10, color: '#000' },
                { text: 'D', weight: 10, color: '#000' }
            ];

            const angle = roulette.getSegmentAngle();
            expect(angle).toBeCloseTo(Math.PI / 2); // 90 degrees for 4 segments
        });
    });

    describe('draw', () => {
        it('should call canvas drawing methods', () => {
            roulette.draw();

            expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 500, 500);
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.translate).toHaveBeenCalledWith(250, 250);
            expect(ctx.rotate).toHaveBeenCalledWith(0);
            expect(ctx.restore).toHaveBeenCalled();
            
            // Should draw segments
            expect(ctx.beginPath).toHaveBeenCalled();
            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
        });

        it('should draw text for each option', () => {
            config.options = [
                { text: 'Option 1', weight: 10, color: '#ff0000' },
                { text: 'Option 2', weight: 10, color: '#00ff00' }
            ];

            roulette.draw();

            expect(ctx.fillText).toHaveBeenCalledWith('Option 1', expect.any(Number), expect.any(Number));
            expect(ctx.fillText).toHaveBeenCalledWith('Option 2', expect.any(Number), expect.any(Number));
        });
    });

    describe('selectWeightedRandom', () => {
        it('should select index based on weights', () => {
            config.options = [
                { text: 'A', weight: 100, color: '#000' },
                { text: 'B', weight: 0, color: '#000' }
            ];

            // Mock Math.random to return 0.5
            jest.spyOn(Math, 'random').mockReturnValue(0.5);

            const index = roulette.selectWeightedRandom();
            expect(index).toBe(0); // Should always select first option with weight 100

            Math.random.mockRestore();
        });

        it('should handle edge case of random exactly at boundary', () => {
            config.options = [
                { text: 'A', weight: 50, color: '#000' },
                { text: 'B', weight: 50, color: '#000' }
            ];

            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            const index = roulette.selectWeightedRandom();
            expect(index).toBe(1);

            Math.random.mockRestore();
        });
    });

    describe('spin', () => {
        let onComplete;

        beforeEach(() => {
            onComplete = jest.fn();
            jest.useFakeTimers();
            
            // Mock performance.now
            global.performance = {
                now: jest.fn(() => 1000)
            };
            
            // Mock Math.random for predictable results
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
        });

        afterEach(() => {
            jest.useRealTimers();
            Math.random.mockRestore();
        });

        it('should not spin if already spinning', () => {
            roulette.isSpinning = true;
            roulette.spin(onComplete);
            
            expect(roulette.animationStartTime).toBe(0);
        });

        it('should not spin with no options', () => {
            config.options = [];
            roulette.spin(onComplete);
            
            expect(roulette.isSpinning).toBe(false);
        });

        it('should start spinning with valid options', () => {
            const animateSpy = jest.spyOn(roulette, 'animate');
            
            roulette.spin(onComplete);

            expect(roulette.isSpinning).toBe(true);
            expect(roulette.onSpinComplete).toBe(onComplete);
            expect(roulette.selectedResult).toBeTruthy();
            expect(roulette.animationStartTime).toBe(1000);
            expect(roulette.animationDuration).toBeGreaterThan(0);
            expect(roulette.targetRotation).toBeGreaterThan(roulette.rotation);
            expect(animateSpy).toHaveBeenCalled();
        });

        it('should calculate spin duration within configured range', () => {
            config.animationConfig.minSpinTime = 2000;
            config.animationConfig.maxSpinTime = 4000;
            
            roulette.spin(onComplete);

            expect(roulette.animationDuration).toBeGreaterThanOrEqual(2000);
            expect(roulette.animationDuration).toBeLessThanOrEqual(4000);
        });

        it('should play sound if enabled', () => {
            const mockAudio = {
                volume: 0,
                play: jest.fn().mockResolvedValue(undefined)
            };
            document.getElementById = jest.fn((id) => {
                if (id === 'spinSound') return mockAudio;
                return null;
            });

            config.soundEnabled = true;
            config.soundVolume = 0.7;

            roulette.spin(onComplete);

            expect(mockAudio.volume).toBe(0.7);
            expect(mockAudio.play).toHaveBeenCalled();
        });
    });

    describe('animate', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            global.performance = {
                now: jest.fn()
                    .mockReturnValueOnce(1000)  // Start time
                    .mockReturnValueOnce(1500)  // Mid animation
                    .mockReturnValueOnce(5000)  // End animation
            };
            global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should not animate if not spinning', () => {
            roulette.isSpinning = false;
            roulette.animate();
            
            expect(ctx.clearRect).not.toHaveBeenCalled();
        });

        it('should update rotation based on progress', () => {
            roulette.isSpinning = true;
            roulette.animationStartTime = 1000;
            roulette.animationDuration = 4000;
            roulette.startRotation = 0;
            roulette.targetRotation = Math.PI * 4;

            roulette.animate();

            // At 500ms of 4000ms = 12.5% progress
            // With cubic ease-out, should have made significant progress
            expect(roulette.rotation).toBeGreaterThan(0);
            expect(roulette.rotation).toBeLessThan(Math.PI * 4);
        });

        it('should complete animation when progress reaches 1', () => {
            const completeSpinSpy = jest.spyOn(roulette, 'completeSpin');
            
            roulette.isSpinning = true;
            roulette.animationStartTime = 1000;
            roulette.animationDuration = 1000;
            roulette.targetRotation = Math.PI * 2;

            // First call - mid animation
            performance.now.mockReturnValueOnce(1500);
            roulette.animate();
            expect(roulette.isSpinning).toBe(true);

            // Second call - animation complete
            performance.now.mockReturnValueOnce(2100);
            roulette.animate();
            
            expect(roulette.isSpinning).toBe(false);
            expect(roulette.rotation).toBe(roulette.targetRotation);
            
            jest.runAllTimers();
            expect(completeSpinSpy).toHaveBeenCalled();
        });
    });

    describe('completeSpin', () => {
        let onComplete;
        let mockWinSound;

        beforeEach(() => {
            onComplete = jest.fn();
            mockWinSound = {
                volume: 0,
                play: jest.fn().mockResolvedValue(undefined),
                pause: jest.fn(),
                currentTime: 0
            };

            document.getElementById = jest.fn((id) => {
                if (id === 'winSound') return mockWinSound;
                if (id === 'spinSound') return mockWinSound;
                return null;
            });
        });

        it('should log error if no result selected', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            roulette.selectedResult = null;
            roulette.completeSpin();

            expect(consoleSpy).toHaveBeenCalledWith('No result selected');
            consoleSpy.mockRestore();
        });

        it('should stop spin sound', () => {
            roulette.selectedResult = { text: 'Winner' };
            roulette.completeSpin();

            expect(mockWinSound.pause).toHaveBeenCalled();
            expect(mockWinSound.currentTime).toBe(0);
        });

        it('should play win sound if enabled', () => {
            config.soundEnabled = true;
            config.soundVolume = 0.8;
            roulette.selectedResult = { text: 'Winner' };
            
            roulette.completeSpin();

            expect(mockWinSound.volume).toBe(0.8);
            expect(mockWinSound.play).toHaveBeenCalled();
        });

        it('should call onSpinComplete callback', () => {
            roulette.selectedResult = { text: 'Winner' };
            roulette.onSpinComplete = onComplete;
            
            roulette.completeSpin();

            expect(onComplete).toHaveBeenCalledWith('Winner');
        });
    });

    describe('reset', () => {
        it('should reset all animation properties', () => {
            // Set some values
            roulette.rotation = Math.PI;
            roulette.isSpinning = true;
            roulette.currentSpeed = 0.5;
            roulette.acceleration = 0.95;
            roulette.animationId = 123;

            roulette.reset();

            expect(roulette.rotation).toBe(0);
            expect(roulette.isSpinning).toBe(false);
            expect(roulette.currentSpeed).toBe(0);
            expect(roulette.acceleration).toBe(0.98);
            expect(ctx.clearRect).toHaveBeenCalled();
        });

        it('should cancel animation frame', () => {
            global.cancelAnimationFrame = jest.fn();
            roulette.animationId = 123;
            
            roulette.reset();

            expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
        });
    });

    describe('updateSize', () => {
        it('should update canvas dimensions and redraw', () => {
            const drawSpy = jest.spyOn(roulette, 'draw');
            
            roulette.updateSize(800, 600);

            expect(canvas.width).toBe(800);
            expect(canvas.height).toBe(600);
            expect(drawSpy).toHaveBeenCalled();
        });
    });
});