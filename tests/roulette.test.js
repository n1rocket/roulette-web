const Roulette = require('../js/roulette');
const { Config } = require('../js/config');

describe('Roulette', () => {
    let canvas;
    let ctx;
    let config;
    let roulette;

    beforeEach(() => {
        global.document = {
            getElementById: jest.fn(() => null)
        };
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
        global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
        ctx = {
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
            textAlign: '',
            font: '',
            shadowColor: '',
            shadowBlur: 0
        };

        canvas = {
            width: 600,
            height: 600,
            getContext: jest.fn(() => ctx)
        };

        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };

        config = new Config();
        roulette = new Roulette(canvas, config);
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(roulette.canvas).toBe(canvas);
            expect(roulette.ctx).toBe(ctx);
            expect(roulette.config).toBe(config);
            expect(roulette.rotation).toBe(0);
            expect(roulette.isSpinning).toBe(false);
            expect(roulette.currentSpeed).toBe(0);
        });
    });

    describe('calculateTotalWeight', () => {
        it('should calculate sum of all option weights', () => {
            config.options = [
                { text: 'A', weight: 10 },
                { text: 'B', weight: 20 },
                { text: 'C', weight: 30 }
            ];
            expect(roulette.calculateTotalWeight()).toBe(60);
        });

        it('should return 0 for empty options', () => {
            config.options = [];
            expect(roulette.calculateTotalWeight()).toBe(0);
        });
    });

    describe('getSegmentAngle', () => {
        it('should calculate correct angle for each segment', () => {
            config.options = [
                { text: 'A', weight: 10 },
                { text: 'B', weight: 20 },
                { text: 'C', weight: 30 }
            ];
            const expectedAngle = (Math.PI * 2) / 3;
            expect(roulette.getSegmentAngle()).toBeCloseTo(expectedAngle);
        });
    });

    describe('draw', () => {
        it('should call canvas drawing methods', () => {
            roulette.draw();
            expect(ctx.clearRect).toHaveBeenCalled();
            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
            expect(ctx.translate).toHaveBeenCalledWith(300, 300);
        });

        it('should draw each option segment', () => {
            const optionsCount = config.options.length;
            roulette.draw();
            expect(ctx.beginPath).toHaveBeenCalledTimes(optionsCount + 1);
            expect(ctx.arc).toHaveBeenCalled();
            expect(ctx.fill).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
        });
    });

    describe('selectWeightedRandom', () => {
        it('should return valid index', () => {
            const index = roulette.selectWeightedRandom();
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(config.options.length);
        });

        it('should respect weight distribution', () => {
            config.options = [
                { text: 'A', weight: 90 },
                { text: 'B', weight: 10 }
            ];
            
            const results = { 0: 0, 1: 0 };
            const iterations = 10000;
            
            for (let i = 0; i < iterations; i++) {
                const index = roulette.selectWeightedRandom();
                results[index]++;
            }
            
            const aPercentage = results[0] / iterations;
            expect(aPercentage).toBeGreaterThan(0.8);
            expect(aPercentage).toBeLessThan(0.95);
        });
    });

    describe('spin', () => {
        it('should not spin if already spinning', () => {
            roulette.isSpinning = true;
            const initialRotation = roulette.rotation;
            roulette.spin();
            expect(roulette.rotation).toBe(initialRotation);
        });

        it('should not spin if no options available', () => {
            config.options = [];
            roulette.spin();
            expect(roulette.isSpinning).toBe(false);
        });

        it('should start spinning with valid options', () => {
            roulette.spin();
            expect(roulette.isSpinning).toBe(true);
            expect(roulette.currentSpeed).toBeGreaterThan(0);
        });

        it('should set target rotation', () => {
            roulette.spin();
            expect(roulette.targetRotation).toBeGreaterThan(roulette.rotation);
        });
    });

    describe('reset', () => {
        it('should reset all properties', () => {
            roulette.rotation = 5;
            roulette.isSpinning = true;
            roulette.currentSpeed = 0.5;
            
            roulette.reset();
            
            expect(roulette.rotation).toBe(0);
            expect(roulette.isSpinning).toBe(false);
            expect(roulette.currentSpeed).toBe(0);
        });
    });

    describe('updateSize', () => {
        it('should update canvas dimensions', () => {
            roulette.updateSize(800, 800);
            expect(canvas.width).toBe(800);
            expect(canvas.height).toBe(800);
        });

        it('should redraw after resize', () => {
            const drawSpy = jest.spyOn(roulette, 'draw');
            roulette.updateSize(800, 800);
            expect(drawSpy).toHaveBeenCalled();
        });
    });
});