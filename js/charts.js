// Chart management for roulette history

class ChartManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.currentChart = 'pie';
        this.animationFrame = null;
    }

    draw(type = 'pie') {
        this.currentChart = type;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (type) {
            case 'pie':
                this.drawPieChart();
                break;
            case 'bar':
                this.drawBarChart();
                break;
            case 'line':
                this.drawLineChart();
                break;
        }
    }

    drawPieChart() {
        const stats = this.config.statistics.optionCounts;
        const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        
        if (total === 0) {
            this.drawNoDataMessage();
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        let currentAngle = -Math.PI / 2;
        
        // Draw pie slices
        this.config.options.forEach(option => {
            const count = stats[option.text] || 0;
            if (count > 0) {
                const sliceAngle = (count / total) * Math.PI * 2;
                
                // Draw slice
                this.ctx.beginPath();
                this.ctx.moveTo(centerX, centerY);
                this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                this.ctx.closePath();
                this.ctx.fillStyle = option.color;
                this.ctx.fill();
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw percentage
                const midAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(midAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(midAngle) * (radius * 0.7);
                
                const percentage = ((count / total) * 100).toFixed(1);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${percentage}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            }
        });
        
        // Draw legend
        this.drawLegend();
    }

    drawBarChart() {
        const stats = this.config.statistics.optionCounts;
        const options = this.config.options.filter(opt => (stats[opt.text] || 0) > 0);
        
        if (options.length === 0) {
            this.drawNoDataMessage();
            return;
        }

        const margin = 40;
        const barWidth = (this.canvas.width - margin * 2) / options.length;
        const maxCount = Math.max(...Object.values(stats));
        const chartHeight = this.canvas.height - margin * 2;
        
        // Draw axes
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, margin);
        this.ctx.lineTo(margin, this.canvas.height - margin);
        this.ctx.lineTo(this.canvas.width - margin, this.canvas.height - margin);
        this.ctx.stroke();
        
        // Draw bars
        options.forEach((option, index) => {
            const count = stats[option.text] || 0;
            const barHeight = (count / maxCount) * chartHeight;
            const x = margin + index * barWidth + barWidth * 0.1;
            const y = this.canvas.height - margin - barHeight;
            
            this.ctx.fillStyle = option.color;
            this.ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Draw count on top
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(count.toString(), x + barWidth * 0.4, y - 5);
            
            // Draw label
            this.ctx.save();
            this.ctx.translate(x + barWidth * 0.4, this.canvas.height - margin + 15);
            this.ctx.rotate(-Math.PI / 4);
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(option.text, 0, 0);
            this.ctx.restore();
        });
    }

    drawLineChart() {
        const history = this.config.history.slice().reverse();
        
        if (history.length < 2) {
            this.drawNoDataMessage();
            return;
        }

        const margin = 40;
        const pointSpacing = (this.canvas.width - margin * 2) / Math.min(history.length - 1, 50);
        const chartHeight = this.canvas.height - margin * 2;
        
        // Group by option
        const optionLines = {};
        this.config.options.forEach(option => {
            optionLines[option.text] = [];
        });
        
        // Process history
        let runningCounts = {};
        history.forEach((entry, index) => {
            runningCounts[entry.result] = (runningCounts[entry.result] || 0) + 1;
            
            Object.keys(optionLines).forEach(optionText => {
                optionLines[optionText].push({
                    x: margin + index * pointSpacing,
                    y: this.canvas.height - margin - ((runningCounts[optionText] || 0) / (index + 1)) * chartHeight,
                    count: runningCounts[optionText] || 0
                });
            });
        });
        
        // Draw axes
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(margin, margin);
        this.ctx.lineTo(margin, this.canvas.height - margin);
        this.ctx.lineTo(this.canvas.width - margin, this.canvas.height - margin);
        this.ctx.stroke();
        
        // Draw lines
        this.config.options.forEach(option => {
            const points = optionLines[option.text];
            if (points.length > 0 && points[points.length - 1].count > 0) {
                this.ctx.strokeStyle = option.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                points.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                
                this.ctx.stroke();
                
                // Draw final point
                const lastPoint = points[points.length - 1];
                this.ctx.fillStyle = option.color;
                this.ctx.beginPath();
                this.ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw time labels
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Inicio', margin, this.canvas.height - margin + 20);
        this.ctx.fillText('Ahora', this.canvas.width - margin, this.canvas.height - margin + 20);
    }

    drawLegend() {
        const stats = this.config.statistics.optionCounts;
        const legendX = 10;
        let legendY = 10;
        
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        this.config.options.forEach(option => {
            const count = stats[option.text] || 0;
            if (count > 0) {
                // Color box
                this.ctx.fillStyle = option.color;
                this.ctx.fillRect(legendX, legendY, 15, 15);
                
                // Text
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(`${option.text} (${count})`, legendX + 20, legendY + 12);
                
                legendY += 20;
            }
        });
    }

    drawNoDataMessage() {
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('No hay datos para mostrar', this.canvas.width / 2, this.canvas.height / 2);
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 20;
        this.canvas.height = 200;
        this.draw(this.currentChart);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartManager;
}