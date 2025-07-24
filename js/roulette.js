class Roulette {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.rotation = 0;
        this.isSpinning = false;
        this.currentSpeed = 0;
        this.targetRotation = 0;
        this.animationId = null;
        this.onSpinComplete = null;
        this.acceleration = 0.98;
        this.selectedResult = null;
    }

    calculateTotalWeight() {
        const options = this.config.getAvailableOptions();
        return options.reduce((sum, option) => sum + option.weight, 0);
    }

    getSegmentAngle() {
        const options = this.config.getAvailableOptions();
        return (Math.PI * 2) / options.length;
    }

    draw() {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.rotation);

        const options = this.config.getAvailableOptions();
        const segmentAngle = this.getSegmentAngle();

        options.forEach((option, index) => {
            const startAngle = index * segmentAngle - Math.PI / 2; // Start from top
            const endAngle = (index + 1) * segmentAngle - Math.PI / 2;

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = option.color;
            this.ctx.fill();

            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.save();
            this.ctx.rotate(startAngle + segmentAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 18px Oswald';
            this.ctx.shadowColor = '#000';
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(option.text, radius - 20, 5);
            this.ctx.restore();
        });

        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff1493';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.restore();
    }

    selectWeightedRandom() {
        const options = this.config.getAvailableOptions();
        const totalWeight = this.calculateTotalWeight();
        let random = Math.random() * totalWeight;

        for (let i = 0; i < options.length; i++) {
            random -= options[i].weight;
            if (random <= 0) {
                return i;
            }
        }
        return options.length - 1;
    }

    spin(onComplete) {
        if (this.isSpinning || this.config.getAvailableOptions().length === 0) {
            return;
        }

        this.isSpinning = true;
        this.onSpinComplete = onComplete;

        const selectedIndex = this.selectWeightedRandom();
        const options = this.config.getAvailableOptions();
        this.selectedResult = options[selectedIndex];
        
        const segmentAngle = this.getSegmentAngle();
        // Calculate the angle where the selected segment currently is
        const segmentStartAngle = selectedIndex * segmentAngle;
        
        // Add some randomness within the segment (not exactly in center)
        const randomOffset = (Math.random() * 0.8 - 0.4) * segmentAngle;
        const targetAngle = segmentStartAngle + segmentAngle / 2 + randomOffset;
        
        // We want this segment to end up at the top (0 radians)
        // So we need to rotate by negative of current position
        let rotationNeeded = -targetAngle;
        
        // Normalize current rotation
        const currentRotation = this.rotation % (Math.PI * 2);
        
        // Calculate actual rotation needed from current position
        rotationNeeded = rotationNeeded - currentRotation;
        
        // Ensure we always rotate forward (clockwise)
        while (rotationNeeded < 0) {
            rotationNeeded += Math.PI * 2;
        }
        
        // Add multiple full rotations for effect
        const spinCount = 5 + Math.floor(Math.random() * 3);
        this.targetRotation = this.rotation + rotationNeeded + (spinCount * Math.PI * 2);
        
        this.currentSpeed = 0.15;
        this.acceleration = 0.98;
        
        console.log('Selected index:', selectedIndex, 'Result:', this.selectedResult.text);

        if (this.config.soundEnabled) {
            const spinSound = document.getElementById('spinSound');
            if (spinSound) {
                spinSound.volume = this.config.soundVolume;
                spinSound.play().catch(e => console.log('Error playing sound:', e));
            }
        }

        this.animate();
    }

    animate() {
        if (!this.isSpinning) {
            return;
        }

        const diff = this.targetRotation - this.rotation;
        
        if (Math.abs(diff) < 0.01 && this.currentSpeed < 0.001) {
            this.rotation = this.targetRotation;
            this.isSpinning = false;
            this.draw();
            setTimeout(() => this.completeSpin(), 100);
            return;
        }

        if (Math.abs(diff) < Math.PI * 2) {
            this.currentSpeed *= this.acceleration;
        }
        
        if (this.currentSpeed < 0.0001) {
            this.currentSpeed = 0.0001;
        }

        this.rotation += diff * this.currentSpeed;
        this.draw();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    completeSpin() {
        if (!this.selectedResult) {
            console.error('No result selected');
            return;
        }
        
        const result = this.selectedResult;

        if (this.config.soundEnabled) {
            const winSound = document.getElementById('winSound');
            if (winSound) {
                winSound.volume = this.config.soundVolume;
                winSound.play().catch(e => console.log('Error playing sound:', e));
            }
        }

        if (this.onSpinComplete) {
            this.onSpinComplete(result.text);
        }
    }

    reset() {
        this.rotation = 0;
        this.isSpinning = false;
        this.currentSpeed = 0;
        this.acceleration = 0.98;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.draw();
    }

    updateSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.draw();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Roulette;
}