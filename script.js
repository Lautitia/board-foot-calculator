// Board Foot Calculator JavaScript

class BoardFootCalculator {
    constructor() {
        this.initializeElements();
        this.loadFromUrlParams(); // Load from URL parameters first
        this.loadSavedValues();
        this.bindEvents();
        this.initializeMainUnitLabels();
        this.initializeDefaultLockState();
        this.calculate();
        
        // Track which field user is currently editing
        this.currentlyEditingField = null;
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
                // Track that user is editing this field
                this.currentlyEditingField = input.id;
                
                // Always recalculate when any input changes
                this.calculate();
                this.autoSaveIfPinned(input);
                
                // Clear the editing field tracking after a short delay
                // to allow calculation to complete
                setTimeout(() => {
                    if (this.currentlyEditingField === input.id) {
                        this.currentlyEditingField = null;
                    }
                }, 100);
            });
            
            // Also track focus events for better user experience
            input.addEventListener('focus', () => {
                this.currentlyEditingField = input.id;
                
                // For total fields, only remove formatting if user manually clicked on them
                // We want to preserve formatting for calculated results
                if ((input.id === 'total-board-feet' || input.id === 'total-cost') && input.value) {
                    // Only remove formatting if the field is editable (not readonly due to calculation)
                    const pinButton = document.querySelector(`[data-field="${input.id}"]`);
                    if (pinButton && pinButton.classList.contains('pinned')) {
                        // Field is pinned/locked, so user can edit it - remove formatting
                        const cleanValue = this.parseFormattedNumber(input.value, false);
                        input.value = cleanValue.toString();
                    }
                    // If not pinned, keep the formatting since it's a calculated result
                }
            });
            
            input.addEventListener('blur', () => {
                // When user finishes editing, reformat the value if it's a total field
                if ((input.id === 'total-board-feet' || input.id === 'total-cost') && input.value) {
                    const pinButton = document.querySelector(`[data-field="${input.id}"]`);
                    if (pinButton && pinButton.classList.contains('pinned')) {
                        // Field is pinned/locked, so format the user's input
                        const formattedValue = this.formatNumberForDisplay(parseFloat(input.value) || 0, 2);
                        input.value = formattedValue;
                    }
                }
                
                setTimeout(() => {
                    this.currentlyEditingField = null;
                }, 100);
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
        if (this.shareButton) {
            this.shareButton.addEventListener('click', () => this.shareResult());
        }
        if (this.reloadButton) {
            this.reloadButton.addEventListener('click', () => this.reloadCalculator());
        }
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => this.clearAllChanges());
        }
        if (this.feedbackYes) {
            this.feedbackYes.addEventListener('click', () => this.submitFeedback(true));
        }
        if (this.feedbackNo) {
            this.feedbackNo.addEventListener('click', () => this.submitFeedback(false));
        }
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

    // Helper method to format numbers with commas for display
    formatNumberForDisplay(number, decimals = 2) {
        if (isNaN(number) || number === null || number === undefined) {
            return '0.00';
        }
        
        const num = parseFloat(number);
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // Helper method to parse numbers that may contain commas and format large numbers
    parseFormattedNumber(value, shouldFormat = true) {
        let cleanNumericString;
        
        if (typeof value === 'string') {
            // Remove existing commas if any
            cleanNumericString = value.replace(/,/g, '');
        } else {
            cleanNumericString = value.toString();
        }
        
        // If shouldFormat is false, just return the numeric value (original behavior)
        if (!shouldFormat) {
            return parseFloat(cleanNumericString) || 0;
        }
        
        // Format the number with thousand separators for large numbers
        // Validate that it's a valid number string
        if (!/^-?\d*\.?\d*$/.test(cleanNumericString) || cleanNumericString === '' || cleanNumericString === '.') {
            return '0.00';
        }
        
        // Split into integer and decimal parts
        const parts = cleanNumericString.split('.');
        let integerPart = parts[0] || '0';
        let decimalPart = parts[1] || '';
        
        // Handle negative numbers
        const isNegative = integerPart.startsWith('-');
        if (isNegative) {
            integerPart = integerPart.substring(1);
        }
        
        // Remove leading zeros from integer part but keep at least one digit
        integerPart = integerPart.replace(/^0+/, '') || '0';
        
        // Add thousand separators to integer part
        // Process from right to left
        let formattedInteger = '';
        for (let i = integerPart.length - 1, count = 0; i >= 0; i--, count++) {
            if (count > 0 && count % 3 === 0) {
                formattedInteger = ',' + formattedInteger;
            }
            formattedInteger = integerPart[i] + formattedInteger;
        }
        
        // Handle decimal part - ensure exactly 2 digits for currency/board feet
        if (decimalPart.length === 0) {
            decimalPart = '00';
        } else if (decimalPart.length === 1) {
            decimalPart = decimalPart + '0';
        } else if (decimalPart.length > 2) {
            // For very long decimal strings, round to 2 decimal places
            // Use string manipulation to avoid precision issues
            let roundDigit = parseInt(decimalPart[2]);
            decimalPart = decimalPart.substring(0, 2);
            
            // Simple rounding logic
            if (roundDigit >= 5) {
                let lastDigit = parseInt(decimalPart[1]) + 1;
                if (lastDigit >= 10) {
                    lastDigit = 0;
                    let secondLastDigit = parseInt(decimalPart[0]) + 1;
                    if (secondLastDigit >= 10) {
                        // Need to carry over to integer part
                        secondLastDigit = 0;
                        // Convert integer part back to number, add 1, then format again
                        let intAsNum = parseInt(integerPart) + 1;
                        integerPart = intAsNum.toString();
                        // Reformat integer part with commas
                        formattedInteger = '';
                        for (let i = integerPart.length - 1, count = 0; i >= 0; i--, count++) {
                            if (count > 0 && count % 3 === 0) {
                                formattedInteger = ',' + formattedInteger;
                            }
                            formattedInteger = integerPart[i] + formattedInteger;
                        }
                    }
                    decimalPart = secondLastDigit.toString() + lastDigit.toString();
                } else {
                    decimalPart = decimalPart[0] + lastDigit.toString();
                }
            }
        }
        
        // Construct the final formatted value
        let finalFormattedValue = formattedInteger + '.' + decimalPart;
        if (isNegative) {
            finalFormattedValue = '-' + finalFormattedValue;
        }
        
        return finalFormattedValue;
    }

    // Load values from URL parameters
    loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if there are any calculator parameters
        const hasCalcParams = ['pieces', 'thickness', 'thicknessUnit', 'thicknessFraction', 'width', 'widthUnit', 'widthFraction', 'length', 'lengthUnit', 'lengthFraction', 'price'].some(param => urlParams.has(param));
        
        if (!hasCalcParams) {
            return; // No parameters to load
        }
        
        // Load input values if they exist in URL
        if (urlParams.has('pieces')) {
            this.pieces.value = urlParams.get('pieces');
        }
        
        if (urlParams.has('thickness')) {
            this.thickness.value = urlParams.get('thickness');
        }
        
        if (urlParams.has('thicknessUnit')) {
            this.thicknessUnit.value = urlParams.get('thicknessUnit');
            this.handleUnitChange(this.thicknessUnit);
        }
        
        if (urlParams.has('thicknessFraction')) {
            this.thicknessFraction.value = urlParams.get('thicknessFraction');
        }
        
        if (urlParams.has('width')) {
            this.width.value = urlParams.get('width');
        }
        
        if (urlParams.has('widthUnit')) {
            this.widthUnit.value = urlParams.get('widthUnit');
            this.handleUnitChange(this.widthUnit);
        }
        
        if (urlParams.has('widthFraction')) {
            this.widthFraction.value = urlParams.get('widthFraction');
        }
        
        if (urlParams.has('length')) {
            this.length.value = urlParams.get('length');
        }
        
        if (urlParams.has('lengthUnit')) {
            this.lengthUnit.value = urlParams.get('lengthUnit');
            this.handleUnitChange(this.lengthUnit);
        }
        
        if (urlParams.has('lengthFraction')) {
            this.lengthFraction.value = urlParams.get('lengthFraction');
        }
        
        if (urlParams.has('price')) {
            this.price.value = urlParams.get('price');
        }
        
        // Clear URL parameters after loading to keep URL clean
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }

    calculate() {
        try {
            // Get current locked states
            const lockedFields = this.getLockedFields();
            
            // Get input values - for locked fields, always use their current values (including empty/0)
            // For unlocked fields, we'll calculate them
            let pieces = parseFloat(this.pieces.value) || (lockedFields.includes('pieces') ? parseFloat(this.pieces.value) || 0 : 1);
            let thickness = parseFloat(this.thickness.value) || 0;
            let thicknessFrac = parseFloat(this.thicknessFraction.value) || 0;
            let width = parseFloat(this.width.value) || 0;
            let widthFrac = parseFloat(this.widthFraction.value) || 0;
            let length = parseFloat(this.length.value) || 0;
            let lengthFrac = parseFloat(this.lengthFraction.value) || 0;
            let pricePerBF = parseFloat(this.price.value) || 0;
            let boardFeet = this.parseFormattedNumber(this.totalBoardFeet.value, false) || 0;
            let totalCost = this.parseFormattedNumber(this.totalCost.value, false) || 0;

            // For locked fields, ensure we use their actual values even if 0
            if (lockedFields.includes('pieces')) {
                pieces = parseFloat(this.pieces.value) || 1; // Default to 1 for pieces if empty
            }

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
                    this.updateResult(this.totalBoardFeet, this.formatNumberForDisplay(boardFeet, 2));
                } else {
                    // If any required dimension is 0 or missing, set board feet to 0
                    boardFeet = 0;
                    this.updateResult(this.totalBoardFeet, '0.00');
                }
            }
            
            if (!lockedFields.includes('total-cost')) {
                // Calculate total cost
                totalCost = boardFeet * pricePerBF;
                this.updateResult(this.totalCost, this.formatNumberForDisplay(totalCost, 2));
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
                this.updateResult(this.totalCost, this.formatNumberForDisplay(totalCost, 2));
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
        
        // For total fields that are being calculated (not pinned), always show formatted values
        // Only avoid updating if user is actively editing a pinned field
        const isEditingPinnedField = this.currentlyEditingField === element.id && 
                                   pinButton && pinButton.classList.contains('pinned');
        
        if (isEditingPinnedField) {
            return;
        }
        
        const oldValue = element.tagName === 'INPUT' ? element.value : element.textContent;
        if (oldValue !== value) {
            if (element.tagName === 'INPUT') {
                // For total fields, always display formatted values when they are calculated results
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
            // User wants to unlock (unpin) this field - this is always allowed
            // because unlocking means adding one more field that can be calculated
            
            // Unlock the field
            button.classList.remove('pinned');
            lockIcon.src = 'public/unlock.svg';
            lockIcon.alt = 'Unlock';
            button.title = 'Value will be calculated';
            this.clearSavedValue(field);
            this.showNotification(`${this.getFieldDisplayName(field)} will now be calculated automatically`, 'info');
        } else {
            // User wants to lock (pin) this field
            // Check if locking this field would leave no unlocked fields
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
                value = this.parseFormattedNumber(this.totalBoardFeet.value, false);
                break;
            case 'total-cost':
                value = this.parseFormattedNumber(this.totalCost.value, false);
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
                        this.totalBoardFeet.value = parseFloat(value).toFixed(2);
                        break;
                    case 'total-cost':
                        this.totalCost.value = parseFloat(value).toFixed(2);
                        break;
                }
            }
        });
    }

    // Button functions
    shareResult() {
        // Create URL with current calculator values as parameters
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams();
        
        // Add all current input values to parameters
        if (this.pieces.value) {
            params.set('pieces', this.pieces.value);
        }
        
        if (this.thickness.value) {
            params.set('thickness', this.thickness.value);
        }
        
        if (this.thicknessUnit.value && this.thicknessUnit.value !== 'in') {
            params.set('thicknessUnit', this.thicknessUnit.value);
        }
        
        if (this.thicknessFraction.value) {
            params.set('thicknessFraction', this.thicknessFraction.value);
        }
        
        if (this.width.value) {
            params.set('width', this.width.value);
        }
        
        if (this.widthUnit.value && this.widthUnit.value !== 'in') {
            params.set('widthUnit', this.widthUnit.value);
        }
        
        if (this.widthFraction.value) {
            params.set('widthFraction', this.widthFraction.value);
        }
        
        if (this.length.value) {
            params.set('length', this.length.value);
        }
        
        if (this.lengthUnit.value && this.lengthUnit.value !== 'ft') {
            params.set('lengthUnit', this.lengthUnit.value);
        }
        
        if (this.lengthFraction.value) {
            params.set('lengthFraction', this.lengthFraction.value);
        }
        
        if (this.price.value) {
            params.set('price', this.price.value);
        }
        
        // Create the share URL
        const shareUrl = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showNotification('Share link copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(shareUrl);
            });
        } else {
            this.fallbackCopyToClipboard(shareUrl);
        }
    }
    
    // Fallback method for copying to clipboard
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Share link copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Unable to copy to clipboard. Please copy the URL manually.', 'warning');
            console.error('Fallback: Could not copy text: ', err);
        }
        
        document.body.removeChild(textArea);
    }

    reloadCalculator() {
        // Reload page
        window.location.reload();
    }

    clearAllChanges() {
        // Clear all localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('bf_calc_'));
        keys.forEach(key => localStorage.removeItem(key));
        
        // Reset all inputs to empty/default values
        this.pieces.value = '1';
        this.thickness.value = '';
        this.thicknessFraction.value = '';
        this.width.value = '';
        this.widthFraction.value = '';
        this.length.value = '';
        this.lengthFraction.value = '';
        this.price.value = '';
        this.totalBoardFeet.value = '0';
        this.totalCost.value = '0';
        
        // Reset units to default
        this.thicknessUnit.value = 'in';
        this.widthUnit.value = 'in';
        this.lengthUnit.value = 'ft';
        
        // Reset composite input displays
        this.handleUnitChange(this.thicknessUnit);
        this.handleUnitChange(this.widthUnit);
        this.handleUnitChange(this.lengthUnit);
        
        // Reset all lock states to unlocked (user can choose which fields to lock)
        this.pinButtons.forEach(button => {
            button.classList.remove('pinned');
            const lockIcon = button.querySelector('.lock-icon');
            if (lockIcon) {
                lockIcon.src = 'public/unlock.svg';
                lockIcon.alt = 'Unlock';
                button.title = 'Value will be calculated';
            }
        });
        
        // Recalculate with new values
        this.calculate();
        
        this.showNotification('All values and lock states have been reset to default', 'success');
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
        // If no saved pin states exist, set default: all fields unlocked
        const hasAnySavedPins = ['pieces', 'thickness', 'width', 'length', 'price', 'total-board-feet', 'total-cost']
            .some(field => localStorage.getItem(`bf_calc_${field}`) !== null);
            
        if (!hasAnySavedPins) {
            // Set all fields to unlocked by default
            this.pinButtons.forEach(button => {
                button.classList.remove('pinned');
                const lockIcon = button.querySelector('.lock-icon');
                if (lockIcon) {
                    lockIcon.src = 'public/unlock.svg';
                    lockIcon.alt = 'Unlock';
                    button.title = 'Value will be calculated';
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
