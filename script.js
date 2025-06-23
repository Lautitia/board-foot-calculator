// Board Foot Calculator JavaScript

class BoardFootCalculator {
    constructor() {
        this.initializeElements();
        this.loadSavedValues();
        this.bindEvents();
        this.calculate();
    }

    initializeElements() {
        // Input elements
        this.pieces = document.getElementById('pieces');
        this.thickness = document.getElementById('thickness');
        this.thicknessFraction = document.getElementById('thickness-fraction');
        this.thicknessUnit = document.getElementById('thickness-unit');
        this.width = document.getElementById('width');
        this.widthFraction = document.getElementById('width-fraction');
        this.widthUnit = document.getElementById('width-unit');
        this.length = document.getElementById('length');
        this.lengthFraction = document.getElementById('length-fraction');
        this.lengthUnit = document.getElementById('length-unit');
        this.price = document.getElementById('price');

        // Result elements
        this.totalBoardFeet = document.getElementById('total-board-feet');
        this.totalCost = document.getElementById('total-cost');

        // Button elements
        this.pinButtons = document.querySelectorAll('.pin-button');
        this.shareButton = document.getElementById('share-result');
        this.reloadButton = document.getElementById('reload-calculator');
        this.clearButton = document.getElementById('clear-all');
        this.feedbackYes = document.getElementById('feedback-yes');
        this.feedbackNo = document.getElementById('feedback-no');

        // Container elements
        this.thicknessInputContainer = document.getElementById('thickness-input-container');
        this.widthInputContainer = document.getElementById('width-input-container');
        this.lengthInputContainer = document.getElementById('length-input-container');
        this.thicknessSubUnit = document.getElementById('thickness-sub-unit');
        this.widthSubUnit = document.getElementById('width-sub-unit');
        this.lengthSubUnit = document.getElementById('length-sub-unit');
    }

    bindEvents() {
        // Input change events
        const inputs = [this.pieces, this.thickness, this.thicknessFraction, this.width, this.widthFraction, this.length, this.lengthFraction, this.price];
        const selects = [this.thicknessUnit, this.widthUnit, this.lengthUnit];

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculate();
                this.autoSaveIfPinned(input);
            });
        });

        selects.forEach(select => {
            select.addEventListener('change', () => {
                this.handleUnitChange(select);
                this.calculate();
                this.autoSaveIfPinned(select);
            });
        });

        // Pin button events
        this.pinButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Ensure we always get the button element, even if clicking on the inner icon
                const targetButton = e.target.closest('.pin-button');
                if (targetButton) {
                    this.togglePin(targetButton);
                }
            });
        });

        // Other button events
        this.shareButton.addEventListener('click', () => this.shareResult());
        this.reloadButton.addEventListener('click', () => this.reloadCalculator());
        this.clearButton.addEventListener('click', () => this.clearAllChanges());
        this.feedbackYes.addEventListener('click', () => this.submitFeedback(true));
        this.feedbackNo.addEventListener('click', () => this.submitFeedback(false));
    }

    handleUnitChange(select) {
        const isComposite = select.value.includes('/');
        let fractionInput, container, subUnitLabel, separator;

        if (select.id === 'thickness-unit') {
            fractionInput = this.thicknessFraction;
            container = this.thicknessInputContainer;
            subUnitLabel = this.thicknessSubUnit;
        } else if (select.id === 'width-unit') {
            fractionInput = this.widthFraction;
            container = this.widthInputContainer;
            subUnitLabel = this.widthSubUnit;
        } else if (select.id === 'length-unit') {
            fractionInput = this.lengthFraction;
            container = this.lengthInputContainer;
            subUnitLabel = this.lengthSubUnit;
        }

        if (fractionInput && container && subUnitLabel) {
            separator = container.querySelector('.separator');
            
            if (isComposite) {
                fractionInput.style.display = 'block';
                separator.style.display = 'inline';
                subUnitLabel.style.display = 'inline';
                container.classList.add('composite');
                
                // Set sub-unit label
                if (select.value === 'ft/in') {
                    subUnitLabel.textContent = 'in';
                } else if (select.value === 'm/cm') {
                    subUnitLabel.textContent = 'cm';
                }
            } else {
                fractionInput.style.display = 'none';
                separator.style.display = 'none';
                subUnitLabel.style.display = 'none';
                fractionInput.value = '';
                container.classList.remove('composite');
            }
        }
    }

    // Unit conversion function
    convertToInches(value, unit, fractionValue = 0) {
        const conversions = {
            'in': 1,
            'ft': 12,
            'mm': 1/25.4,
            'cm': 1/2.54,
            'm': 1/0.0254,
            'ft/in': (val, frac) => (parseFloat(val || 0) * 12) + parseFloat(frac || 0),
            'm/cm': (val, frac) => (parseFloat(val || 0) / 0.0254) + (parseFloat(frac || 0) / 2.54)
        };

        if (typeof conversions[unit] === 'function') {
            return conversions[unit](value, fractionValue);
        }
        return parseFloat(value || 0) * conversions[unit];
    }

    calculate() {
        try {
            // Get input values
            const pieces = parseFloat(this.pieces.value) || 1;
            const thickness = parseFloat(this.thickness.value) || 0;
            const thicknessFrac = parseFloat(this.thicknessFraction.value) || 0;
            const width = parseFloat(this.width.value) || 0;
            const widthFrac = parseFloat(this.widthFraction.value) || 0;
            const length = parseFloat(this.length.value) || 0;
            const lengthFrac = parseFloat(this.lengthFraction.value) || 0;
            const pricePerBF = parseFloat(this.price.value) || 0;

            // Convert to inches
            const thicknessInches = this.convertToInches(thickness, this.thicknessUnit.value, thicknessFrac);
            const widthInches = this.convertToInches(width, this.widthUnit.value, widthFrac);
            const lengthInches = this.convertToInches(length, this.lengthUnit.value, lengthFrac);

            // Calculate board feet
            // Formula: (thickness × width × length) ÷ 144 × pieces
            let boardFeet = 0;
            if (thicknessInches > 0 && widthInches > 0 && lengthInches > 0) {
                boardFeet = (thicknessInches * widthInches * lengthInches) / 144 * pieces;
            }

            // Calculate total cost
            const totalCost = boardFeet * pricePerBF;

            // Update display
            this.updateResult(this.totalBoardFeet, boardFeet.toFixed(2));
            this.updateResult(this.totalCost, totalCost.toFixed(2));

        } catch (error) {
            console.error('Calculation error:', error);
            this.updateResult(this.totalBoardFeet, '0');
            this.updateResult(this.totalCost, '0');
        }
    }

    updateResult(element, value) {
        const oldValue = element.textContent;
        if (oldValue !== value) {
            element.textContent = value;
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 300);
        }
    }

    // Auto-save functionality
    autoSaveIfPinned(element) {
        let field;
        
        // Determine field name based on element ID
        switch(element.id) {
            case 'pieces':
                field = 'pieces';
                break;
            case 'thickness':
            case 'thickness-fraction':
                field = 'thickness';
                break;
            case 'thickness-unit':
                field = 'thickness';
                break;
            case 'width':
            case 'width-fraction':
                field = 'width';
                break;
            case 'width-unit':
                field = 'width';
                break;
            case 'length':
            case 'length-fraction':
                field = 'length';
                break;
            case 'length-unit':
                field = 'length';
                break;
            case 'price':
                field = 'price';
                break;
        }
        
        if (field) {
            const pinButton = document.querySelector(`[data-field="${field}"]`);
            if (pinButton && pinButton.classList.contains('pinned')) {
                this.saveValue(field);
            }
        }
    }

    // Save and load functionality
    togglePin(button) {
        const field = button.dataset.field;
        const isPinned = button.classList.contains('pinned');
        
        if (isPinned) {
            // Unpin value
            button.classList.remove('pinned');
            this.clearSavedValue(field);
            this.showNotification(`Disabled auto-save for ${this.getFieldDisplayName(field)}`, 'info');
        } else {
            // Pin value
            button.classList.add('pinned');
            this.saveValue(field);
            this.showNotification(`Enabled auto-save for ${this.getFieldDisplayName(field)}`, 'success');
        }
    }

    clearSavedValue(field) {
        localStorage.removeItem(`bf_calc_${field}`);
        localStorage.removeItem(`bf_calc_${field}_unit`);
        localStorage.removeItem(`bf_calc_${field}_fraction`);
    }

    getFieldDisplayName(field) {
        const names = {
            'pieces': 'Number of Pieces',
            'thickness': 'Thickness',
            'width': 'Width',
            'length': 'Length',
            'price': 'Price per Board Foot'
        };
        return names[field] || field;
    }

    saveValue(field) {
        let value, unit;
        
        switch(field) {
            case 'pieces':
                value = this.pieces.value;
                break;
            case 'thickness':
                value = this.thickness.value;
                const thicknessFrac = this.thicknessFraction.value;
                unit = this.thicknessUnit.value;
                localStorage.setItem(`bf_calc_${field}_fraction`, thicknessFrac);
                break;
            case 'width':
                value = this.width.value;
                const widthFrac = this.widthFraction.value;
                unit = this.widthUnit.value;
                localStorage.setItem(`bf_calc_${field}_fraction`, widthFrac);
                break;
            case 'length':
                value = this.length.value;
                const lengthFrac = this.lengthFraction.value;
                unit = this.lengthUnit.value;
                localStorage.setItem(`bf_calc_${field}_fraction`, lengthFrac);
                break;
            case 'price':
                value = this.price.value;
                break;
        }
        
        localStorage.setItem(`bf_calc_${field}`, value);
        if (unit) {
            localStorage.setItem(`bf_calc_${field}_unit`, unit);
        }
    }

    loadSavedValues() {
        const fields = ['pieces', 'thickness', 'width', 'length', 'price'];
        
        fields.forEach(field => {
            const value = localStorage.getItem(`bf_calc_${field}`);
            const unit = localStorage.getItem(`bf_calc_${field}_unit`);
            const fraction = localStorage.getItem(`bf_calc_${field}_fraction`);
            
            if (value !== null) {
                // Mark as pinned
                const pinButton = document.querySelector(`[data-field="${field}"]`);
                if (pinButton) {
                    pinButton.classList.add('pinned');
                }
                
                // Set values
                switch(field) {
                    case 'pieces':
                        this.pieces.value = value;
                        break;
                    case 'thickness':
                        this.thickness.value = value;
                        if (unit) {
                            this.thicknessUnit.value = unit;
                            this.handleUnitChange(this.thicknessUnit);
                        }
                        if (fraction) this.thicknessFraction.value = fraction;
                        break;
                    case 'width':
                        this.width.value = value;
                        if (unit) {
                            this.widthUnit.value = unit;
                            this.handleUnitChange(this.widthUnit);
                        }
                        if (fraction) this.widthFraction.value = fraction;
                        break;
                    case 'length':
                        this.length.value = value;
                        if (unit) {
                            this.lengthUnit.value = unit;
                            this.handleUnitChange(this.lengthUnit);
                        }
                        if (fraction) this.lengthFraction.value = fraction;
                        break;
                    case 'price':
                        this.price.value = value;
                        break;
                }
            }
        });
    }

    // Button functions
    shareResult() {
        const boardFeet = this.totalBoardFeet.textContent;
        const cost = this.totalCost.textContent;
        const shareText = `Board Foot Calculation Result: ${boardFeet} board feet, Total Cost: $${cost}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Board Foot Calculator Result',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Calculation result copied to clipboard', 'success');
            }).catch(() => {
                // If copy fails, show result
                alert(shareText);
            });
        }
    }

    reloadCalculator() {
        // Reload page
        window.location.reload();
    }

    clearAllChanges() {
        // Clear all localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('bf_calc_'));
        keys.forEach(key => localStorage.removeItem(key));
        
        // Reset all inputs
        this.pieces.value = '1';
        this.thickness.value = '';
        this.width.value = '';
        this.widthFraction.value = '';
        this.length.value = '';
        this.lengthFraction.value = '';
        this.price.value = '';
        
        // Reset units
        this.thicknessUnit.value = 'in';
        this.widthUnit.value = 'in';
        this.lengthUnit.value = 'ft';
        
        // Reset composite input boxes
        this.handleUnitChange(this.widthUnit);
        this.handleUnitChange(this.lengthUnit);
        
        // Remove all pinned states
        this.pinButtons.forEach(button => {
            button.classList.remove('pinned');
        });
        
        // Recalculate
        this.calculate();
        
        this.showNotification('All settings have been reset', 'success');
    }

    submitFeedback(isPositive) {
        const button = isPositive ? this.feedbackYes : this.feedbackNo;
        
        // Add selection effect
        this.feedbackYes.classList.remove('selected');
        this.feedbackNo.classList.remove('selected');
        button.classList.add('selected');
        
        // Save feedback to localStorage
        localStorage.setItem('bf_calc_feedback', isPositive ? 'positive' : 'negative');
        localStorage.setItem('bf_calc_feedback_date', new Date().toISOString());
        
        // Show thank you message
        const message = isPositive ? 'Thank you for your positive feedback!' : 'Thank you for your feedback, we will continue to improve.';
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInDown 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    window.boardFootCalculator = new BoardFootCalculator();
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Page Error:', e);
});

// Save state when page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Auto-save current pinned values when page is hidden
        const calculator = window.boardFootCalculator;
        if (calculator) {
            calculator.pinButtons.forEach(button => {
                if (button.classList.contains('pinned')) {
                    calculator.saveValue(button.dataset.field);
                }
            });
        }
    }
});
