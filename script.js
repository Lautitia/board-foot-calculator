// Board Foot Calculator JavaScript

class BoardFootCalculator {
    constructor() {
        this.initializeElements();
        this.loadSavedValues();
        this.bindEvents();
        this.initializeMainUnitLabels();
        this.initializeDefaultLockState();
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
        
        // Main unit labels
        this.thicknessMainUnit = document.getElementById('thickness-main-unit');
        this.widthMainUnit = document.getElementById('width-main-unit');
        this.lengthMainUnit = document.getElementById('length-main-unit');
    }

    initializeMainUnitLabels() {
        // Set initial main unit labels based on default selected values
        this.handleUnitChange(this.thicknessUnit);
        this.handleUnitChange(this.widthUnit);
        this.handleUnitChange(this.lengthUnit);
    }

    bindEvents() {
        // Input change events
        const inputs = [this.pieces, this.thickness, this.thicknessFraction, this.width, this.widthFraction, this.length, this.lengthFraction, this.price, this.totalBoardFeet, this.totalCost];
        const selects = [this.thicknessUnit, this.widthUnit, this.lengthUnit];

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // Always recalculate when any input changes
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
        let fractionInput, container, subUnitLabel, separator, mainInput, mainUnitLabel;

        if (select.id === 'thickness-unit') {
            fractionInput = this.thicknessFraction;
            container = this.thicknessInputContainer;
            subUnitLabel = this.thicknessSubUnit;
            mainInput = this.thickness;
            mainUnitLabel = this.thicknessMainUnit;
        } else if (select.id === 'width-unit') {
            fractionInput = this.widthFraction;
            container = this.widthInputContainer;
            subUnitLabel = this.widthSubUnit;
            mainInput = this.width;
            mainUnitLabel = this.widthMainUnit;
        } else if (select.id === 'length-unit') {
            fractionInput = this.lengthFraction;
            container = this.lengthInputContainer;
            subUnitLabel = this.lengthSubUnit;
            mainInput = this.length;
            mainUnitLabel = this.lengthMainUnit;
        }

        if (fractionInput && container && subUnitLabel && mainInput && mainUnitLabel) {
            separator = container.querySelector('.separator');
            
            if (isComposite) {
                // Ensure main input is visible
                mainInput.style.display = 'block';
                fractionInput.style.display = 'block';
                separator.style.display = 'inline';
                subUnitLabel.style.display = 'inline';
                container.classList.add('composite');
                
                // Set unit labels for composite units
                if (select.value === 'ft/in') {
                    mainUnitLabel.textContent = 'ft';
                    subUnitLabel.textContent = 'in';
                } else if (select.value === 'm/cm') {
                    mainUnitLabel.textContent = 'm';
                    subUnitLabel.textContent = 'cm';
                }
            } else {
                // Ensure main input is visible for non-composite units
                mainInput.style.display = 'block';
                fractionInput.style.display = 'none';
                separator.style.display = 'none';
                subUnitLabel.style.display = 'none';
                fractionInput.value = '';
                container.classList.remove('composite');
                
                // Set main unit label for non-composite units
                const unitMap = {
                    'in': 'in',
                    'mm': 'mm',
                    'cm': 'cm',
                    'm': 'm',
                    'ft': 'ft'
                };
                mainUnitLabel.textContent = unitMap[select.value] || select.value;
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

    // Helper method to get locked fields
    getLockedFields() {
        const lockedFields = [];
        this.pinButtons.forEach(button => {
            if (button.classList.contains('pinned')) {
                lockedFields.push(button.dataset.field);
            }
        });
        return lockedFields;
    }

    // Helper method to get unlocked fields
    getUnlockedFields() {
        const unlockedFields = [];
        this.pinButtons.forEach(button => {
            if (!button.classList.contains('pinned')) {
                unlockedFields.push(button.dataset.field);
            }
        });
        return unlockedFields;
    }

    // Convert from inches back to specified unit
    convertFromInches(inches, unit) {
        const conversions = {
            'in': inches,
            'ft': inches / 12,
            'mm': inches * 25.4,
            'cm': inches * 2.54,
            'm': inches * 0.0254,
            'ft/in': {
                main: Math.floor(inches / 12),
                fraction: inches % 12
            },
            'm/cm': {
                main: Math.floor(inches * 0.0254),
                fraction: (inches * 0.0254 - Math.floor(inches * 0.0254)) * 100
            }
        };

        const result = conversions[unit];
        if (typeof result === 'object') {
            return result;
        }
        return { main: result };
    }

    calculate() {
        try {
            // Get current locked states
            const lockedFields = this.getLockedFields();
            
            // Get input values (use current values for locked fields, 0 for unlocked if empty)
            let pieces = parseFloat(this.pieces.value) || (lockedFields.includes('pieces') ? parseFloat(this.pieces.value) || 1 : 1);
            let thickness = parseFloat(this.thickness.value) || 0;
            let thicknessFrac = parseFloat(this.thicknessFraction.value) || 0;
            let width = parseFloat(this.width.value) || 0;
            let widthFrac = parseFloat(this.widthFraction.value) || 0;
            let length = parseFloat(this.length.value) || 0;
            let lengthFrac = parseFloat(this.lengthFraction.value) || 0;
            let pricePerBF = parseFloat(this.price.value) || 0;
            let boardFeet = parseFloat(this.totalBoardFeet.value) || 0;
            let totalCost = parseFloat(this.totalCost.value) || 0;

            // Convert dimensions to inches
            let thicknessInches = this.convertToInches(thickness, this.thicknessUnit.value, thicknessFrac);
            let widthInches = this.convertToInches(width, this.widthUnit.value, widthFrac);
            let lengthInches = this.convertToInches(length, this.lengthUnit.value, lengthFrac);

            // Calculate missing values based on locked fields
            // Board feet formula: (thickness × width × length) ÷ 144 × pieces
            
            if (!lockedFields.includes('total-board-feet')) {
                // Calculate board feet from dimensions
                if (thicknessInches > 0 && widthInches > 0 && lengthInches > 0 && pieces > 0) {
                    boardFeet = (thicknessInches * widthInches * lengthInches) / 144 * pieces;
                } else {
                    boardFeet = 0;
                }
                this.updateResult(this.totalBoardFeet, boardFeet.toFixed(2));
            }
            
            if (!lockedFields.includes('total-cost')) {
                // Calculate total cost
                totalCost = boardFeet * pricePerBF;
                this.updateResult(this.totalCost, totalCost.toFixed(2));
            }
            
            // Reverse calculations - if we have board feet and some dimensions, calculate missing dimension
            if (lockedFields.includes('total-board-feet') && boardFeet > 0) {
                const unlockedDimensions = [];
                if (!lockedFields.includes('pieces')) unlockedDimensions.push('pieces');
                if (!lockedFields.includes('thickness')) unlockedDimensions.push('thickness');
                if (!lockedFields.includes('width')) unlockedDimensions.push('width');
                if (!lockedFields.includes('length')) unlockedDimensions.push('length');
                
                // Only calculate if exactly one dimension is unlocked
                if (unlockedDimensions.length === 1) {
                    const unlockedDim = unlockedDimensions[0];
                    
                    if (unlockedDim === 'pieces' && thicknessInches > 0 && widthInches > 0 && lengthInches > 0) {
                        pieces = (boardFeet * 144) / (thicknessInches * widthInches * lengthInches);
                        this.updateResult(this.pieces, Math.round(pieces));
                    } else if (unlockedDim === 'thickness' && pieces > 0 && widthInches > 0 && lengthInches > 0) {
                        thicknessInches = (boardFeet * 144) / (pieces * widthInches * lengthInches);
                        // Convert back to the selected unit
                        const thicknessInSelectedUnit = this.convertFromInches(thicknessInches, this.thicknessUnit.value);
                        this.updateResult(this.thickness, thicknessInSelectedUnit.main.toFixed(3));
                        if (thicknessInSelectedUnit.fraction !== undefined) {
                            this.updateResult(this.thicknessFraction, thicknessInSelectedUnit.fraction.toFixed(3));
                        }
                    } else if (unlockedDim === 'width' && pieces > 0 && thicknessInches > 0 && lengthInches > 0) {
                        widthInches = (boardFeet * 144) / (pieces * thicknessInches * lengthInches);
                        const widthInSelectedUnit = this.convertFromInches(widthInches, this.widthUnit.value);
                        this.updateResult(this.width, widthInSelectedUnit.main.toFixed(3));
                        if (widthInSelectedUnit.fraction !== undefined) {
                            this.updateResult(this.widthFraction, widthInSelectedUnit.fraction.toFixed(3));
                        }
                    } else if (unlockedDim === 'length' && pieces > 0 && thicknessInches > 0 && widthInches > 0) {
                        lengthInches = (boardFeet * 144) / (pieces * thicknessInches * widthInches);
                        const lengthInSelectedUnit = this.convertFromInches(lengthInches, this.lengthUnit.value);
                        this.updateResult(this.length, lengthInSelectedUnit.main.toFixed(3));
                        if (lengthInSelectedUnit.fraction !== undefined) {
                            this.updateResult(this.lengthFraction, lengthInSelectedUnit.fraction.toFixed(3));
                        }
                    }
                }
            }
            
            // Price calculations
            if (lockedFields.includes('total-cost') && totalCost > 0 && boardFeet > 0 && !lockedFields.includes('price')) {
                pricePerBF = totalCost / boardFeet;
                this.updateResult(this.price, pricePerBF.toFixed(2));
            } else if (lockedFields.includes('price') && pricePerBF > 0 && boardFeet > 0 && !lockedFields.includes('total-cost')) {
                totalCost = boardFeet * pricePerBF;
                this.updateResult(this.totalCost, totalCost.toFixed(2));
            }

        } catch (error) {
            console.error('Calculation error:', error);
        }
    }

    updateResult(element, value) {
        // Check if this result field is pinned (locked)
        const field = element.id;
        const pinButton = document.querySelector(`[data-field="${field}"]`);
        
        // If pinned, don't update the value
        if (pinButton && pinButton.classList.contains('pinned')) {
            return;
        }
        
        const oldValue = element.tagName === 'INPUT' ? element.value : element.textContent;
        if (oldValue !== value) {
            if (element.tagName === 'INPUT') {
                element.value = value;
            } else {
                element.textContent = value;
            }
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
            case 'total-board-feet':
                field = 'total-board-feet';
                break;
            case 'total-cost':
                field = 'total-cost';
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
        const lockIcon = button.querySelector('.lock-icon');
        
        if (isPinned) {
            // User wants to unlock (unpin) this field
            // Check if unlocking this field would leave too few locked fields
            const lockedFields = this.getLockedFields();
            if (lockedFields.length <= 1) {
                this.showNotification(`At least one field must remain unlocked for calculation. Cannot unlock all fields.`, 'warning');
                return;
            }
            
            // Unlock the field
            button.classList.remove('pinned');
            lockIcon.src = 'public/unlock.svg';
            lockIcon.alt = 'Unlock';
            button.title = 'Value will be calculated';
            this.clearSavedValue(field);
            this.showNotification(`${this.getFieldDisplayName(field)} will now be calculated automatically`, 'info');
        } else {
            // User wants to lock (pin) this field
            // Check if locking this field would leave too many unlocked fields
            const unlockedFields = this.getUnlockedFields();
            if (unlockedFields.length <= 1) {
                this.showNotification(`At least one field must remain unlocked for calculation.`, 'warning');
                return;
            }
            
            // Lock the field
            button.classList.add('pinned');
            lockIcon.src = 'public/lock.svg';
            lockIcon.alt = 'Lock';
            button.title = 'Value Locked';
            this.saveValue(field);
            this.showNotification(`${this.getFieldDisplayName(field)} is now locked to its current value`, 'success');
        }
        
        // Recalculate after pin state change
        this.calculate();
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
            'price': 'Price per Board Foot',
            'total-board-feet': 'Total Board Feet',
            'total-cost': 'Total Cost'
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
            case 'total-board-feet':
                value = this.totalBoardFeet.value;
                break;
            case 'total-cost':
                value = this.totalCost.value;
                break;
        }
        
        localStorage.setItem(`bf_calc_${field}`, value);
        if (unit) {
            localStorage.setItem(`bf_calc_${field}_unit`, unit);
        }
    }

    loadSavedValues() {
        const fields = ['pieces', 'thickness', 'width', 'length', 'price', 'total-board-feet', 'total-cost'];
        
        fields.forEach(field => {
            const value = localStorage.getItem(`bf_calc_${field}`);
            const unit = localStorage.getItem(`bf_calc_${field}_unit`);
            const fraction = localStorage.getItem(`bf_calc_${field}_fraction`);
            
            if (value !== null) {
                // Mark as pinned and update icon
                const pinButton = document.querySelector(`[data-field="${field}"]`);
                if (pinButton) {
                    pinButton.classList.add('pinned');
                    const lockIcon = pinButton.querySelector('.lock-icon');
                    if (lockIcon) {
                        lockIcon.src = 'public/lock.svg';
                        lockIcon.alt = 'Lock';
                        pinButton.title = 'Value Locked';
                    }
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
                    case 'total-board-feet':
                        this.totalBoardFeet.value = value;
                        break;
                    case 'total-cost':
                        this.totalCost.value = value;
                        break;
                }
            }
        });
    }

    // Button functions
    shareResult() {
        const boardFeet = this.totalBoardFeet.value;
        const cost = this.totalCost.value;
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
        this.totalBoardFeet.value = '0';
        this.totalCost.value = '0';
        
        // Reset units
        this.thicknessUnit.value = 'in';
        this.widthUnit.value = 'in';
        this.lengthUnit.value = 'ft';
        
        // Reset composite input boxes
        this.handleUnitChange(this.widthUnit);
        this.handleUnitChange(this.lengthUnit);
        
        // Remove all pinned states and reset icons
        this.pinButtons.forEach(button => {
            button.classList.remove('pinned');
            const lockIcon = button.querySelector('.lock-icon');
            if (lockIcon) {
                lockIcon.src = 'public/unlock.svg';
                lockIcon.alt = 'Unlock';
                button.title = 'Save Value';
            }
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

    initializeDefaultLockState() {
        // If no saved pin states exist, set default: lock most fields, leave one unlocked
        const hasAnySavedPins = ['pieces', 'thickness', 'width', 'length', 'price', 'total-board-feet', 'total-cost']
            .some(field => localStorage.getItem(`bf_calc_${field}`) !== null);
            
        if (!hasAnySavedPins) {
            // Lock most fields by default, leave total-board-feet unlocked for calculation
            this.pinButtons.forEach(button => {
                const field = button.dataset.field;
                if (field !== 'total-board-feet') {
                    button.classList.add('pinned');
                    const lockIcon = button.querySelector('.lock-icon');
                    if (lockIcon) {
                        lockIcon.src = 'public/lock.svg';
                        lockIcon.alt = 'Lock';
                        button.title = 'Value Locked';
                    }
                } else {
                    // Keep total-board-feet unlocked for calculation
                    button.classList.remove('pinned');
                    const lockIcon = button.querySelector('.lock-icon');
                    if (lockIcon) {
                        lockIcon.src = 'public/unlock.svg';
                        lockIcon.alt = 'Unlock';
                        button.title = 'Value will be calculated';
                    }
                }
            });
        }
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
