// Particle effects for winning animations

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.emitters = [];
        this.animationId = null;
        this.resizeHandler = null;
    }

    init() {
        // Create canvas for particles
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particleCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Store reference to handler for cleanup
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createConfetti(x, y, count = 50) {
        const colors = ['#ff1493', '#dc143c', '#ff7b00', '#1e90ff', '#9400d3'];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 5 + Math.random() * 10;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 5 + Math.random() * 5,
                gravity: 0.1,
                drag: 0.99,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                opacity: 1,
                fadeRate: 0.01,
                type: 'confetti'
            });
        }
    }

    createFireworks(x, y) {
        const particleCount = 30;
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 8 + Math.random() * 4;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                size: 3,
                gravity: 0.05,
                drag: 0.98,
                opacity: 1,
                fadeRate: 0.02,
                trail: [],
                maxTrailLength: 10,
                type: 'firework'
            });
        }
    }

    createStars(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100;
            
            this.particles.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                targetX: x + Math.cos(angle) * (distance + 200),
                targetY: y + Math.sin(angle) * (distance + 200),
                size: 10 + Math.random() * 10,
                rotation: 0,
                rotationSpeed: 0.05 + Math.random() * 0.05,
                opacity: 0,
                fadeIn: true,
                fadeRate: 0.03,
                type: 'star'
            });
        }
    }

    createSparkles(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3,
                size: 2 + Math.random() * 4,
                opacity: 1,
                fadeRate: 0.02,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.1 + Math.random() * 0.1,
                type: 'sparkle'
            });
        }
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            if (p.vx !== undefined) {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= p.drag || 1;
                p.vy *= p.drag || 1;
                p.vy += p.gravity || 0;
            }

            // Update rotation
            if (p.rotation !== undefined) {
                p.rotation += p.rotationSpeed || 0;
            }

            // Update opacity
            if (p.fadeIn) {
                p.opacity = Math.min(1, p.opacity + p.fadeRate);
                if (p.opacity >= 1) {
                    p.fadeIn = false;
                }
            } else {
                p.opacity -= p.fadeRate;
            }

            // Update trail
            if (p.trail) {
                p.trail.push({ x: p.x, y: p.y });
                if (p.trail.length > p.maxTrailLength) {
                    p.trail.shift();
                }
            }

            // Update twinkle
            if (p.twinkle !== undefined) {
                p.twinkle += p.twinkleSpeed;
            }

            // Move stars
            if (p.type === 'star' && p.targetX) {
                p.x += (p.targetX - p.x) * 0.05;
                p.y += (p.targetY - p.y) * 0.05;
            }

            // Remove dead particles
            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            this.ctx.save();

            // Draw trail
            if (p.trail) {
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                p.trail.forEach((point, index) => {
                    this.ctx.globalAlpha = (index / p.trail.length) * p.opacity * 0.5;
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
            }

            this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y);

            if (p.rotation !== undefined) {
                this.ctx.rotate(p.rotation);
            }

            switch (p.type) {
                case 'confetti':
                    this.drawConfetti(p);
                    break;
                case 'star':
                    this.drawStar(p);
                    break;
                case 'sparkle':
                    this.drawSparkle(p);
                    break;
                default:
                    this.drawCircle(p);
            }

            this.ctx.restore();
        });
    }

    drawConfetti(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }

    drawStar(p) {
        const spikes = 5;
        const outerRadius = p.size;
        const innerRadius = p.size / 2;

        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            
            if (i === 0) {
                this.ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            } else {
                this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSparkle(p) {
        const opacity = Math.sin(p.twinkle) * 0.5 + 0.5;
        this.ctx.globalAlpha = p.opacity * opacity;
        this.ctx.fillStyle = '#ffffff';
        
        // Draw cross sparkle
        this.ctx.fillRect(-p.size / 2, -1, p.size, 2);
        this.ctx.fillRect(-1, -p.size / 2, 2, p.size);
    }

    drawCircle(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    clear() {
        this.particles = [];
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    destroy() {
        // Stop animation
        this.stop();
        
        // Clear particles
        this.clear();
        
        // Remove event listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        // Clear references
        this.canvas = null;
        this.ctx = null;
        this.emitters = [];
    }

    celebrate() {
        // Get modal position for centered effects
        const modal = document.querySelector('.modal-content');
        const rect = modal ? modal.getBoundingClientRect() : { 
            left: window.innerWidth / 2, 
            top: window.innerHeight / 2 
        };
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create multiple effects
        this.createConfetti(centerX, centerY, 100);
        this.createStars(centerX, centerY, 30);
        this.createSparkles(centerX, centerY, 50);

        // Create fireworks at random positions
        setTimeout(() => {
            this.createFireworks(window.innerWidth * 0.2, window.innerHeight * 0.3);
        }, 300);

        setTimeout(() => {
            this.createFireworks(window.innerWidth * 0.8, window.innerHeight * 0.3);
        }, 600);

        setTimeout(() => {
            this.createFireworks(window.innerWidth * 0.5, window.innerHeight * 0.2);
        }, 900);
    }
}

// Initialize particle system
let particleSystem;
document.addEventListener('DOMContentLoaded', () => {
    particleSystem = new ParticleSystem();
    particleSystem.init();
    particleSystem.start();
});