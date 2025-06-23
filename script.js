// 板英尺计算器 JavaScript

class BoardFootCalculator {
    constructor() {
        this.initializeElements();
        this.loadSavedValues();
        this.bindEvents();
        this.calculate();
    }

    initializeElements() {
        // 输入元素
        this.pieces = document.getElementById('pieces');
        this.thickness = document.getElementById('thickness');
        this.thicknessUnit = document.getElementById('thickness-unit');
        this.width = document.getElementById('width');
        this.widthFraction = document.getElementById('width-fraction');
        this.widthUnit = document.getElementById('width-unit');
        this.length = document.getElementById('length');
        this.lengthFraction = document.getElementById('length-fraction');
        this.lengthUnit = document.getElementById('length-unit');
        this.price = document.getElementById('price');

        // 结果元素
        this.totalBoardFeet = document.getElementById('total-board-feet');
        this.totalCost = document.getElementById('total-cost');

        // 按钮元素
        this.pinButtons = document.querySelectorAll('.pin-button');
        this.shareButton = document.getElementById('share-result');
        this.reloadButton = document.getElementById('reload-calculator');
        this.clearButton = document.getElementById('clear-all');
        this.feedbackYes = document.getElementById('feedback-yes');
        this.feedbackNo = document.getElementById('feedback-no');

        // 容器元素
        this.widthInputContainer = document.getElementById('width-input-container');
        this.lengthInputContainer = document.getElementById('length-input-container');
    }

    bindEvents() {
        // 输入变化事件
        const inputs = [this.pieces, this.thickness, this.width, this.widthFraction, this.length, this.lengthFraction, this.price];
        const selects = [this.thicknessUnit, this.widthUnit, this.lengthUnit];

        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        selects.forEach(select => {
            select.addEventListener('change', () => {
                this.handleUnitChange(select);
                this.calculate();
            });
        });

        // 图钉按钮事件
        this.pinButtons.forEach(button => {
            button.addEventListener('click', (e) => this.togglePin(e.target));
        });

        // 其他按钮事件
        this.shareButton.addEventListener('click', () => this.shareResult());
        this.reloadButton.addEventListener('click', () => this.reloadCalculator());
        this.clearButton.addEventListener('click', () => this.clearAllChanges());
        this.feedbackYes.addEventListener('click', () => this.submitFeedback(true));
        this.feedbackNo.addEventListener('click', () => this.submitFeedback(false));
    }

    handleUnitChange(select) {
        const isComposite = select.value.includes('/');
        let fractionInput, container;

        if (select.id === 'width-unit') {
            fractionInput = this.widthFraction;
            container = this.widthInputContainer;
        } else if (select.id === 'length-unit') {
            fractionInput = this.lengthFraction;
            container = this.lengthInputContainer;
        }

        if (fractionInput && container) {
            if (isComposite) {
                fractionInput.style.display = 'block';
                container.classList.add('composite');
                // 更新占位符
                if (select.value === 'ft/in') {
                    fractionInput.placeholder = '英寸部分';
                } else if (select.value === 'm/cm') {
                    fractionInput.placeholder = '厘米部分';
                }
            } else {
                fractionInput.style.display = 'none';
                fractionInput.value = '';
                container.classList.remove('composite');
            }
        }
    }

    // 单位转换函数
    convertToInches(value, unit, fractionValue = 0) {
        const conversions = {
            'in': 1,
            'ft': 12,
            'mm': 1/25.4,
            'cm': 1/2.54,
            'm': 1/0.0254,
            'ft/in': (val, frac) => val * 12 + parseFloat(frac || 0),
            'm/cm': (val, frac) => val / 0.0254 + (parseFloat(frac || 0) / 2.54)
        };

        if (typeof conversions[unit] === 'function') {
            return conversions[unit](value, fractionValue);
        }
        return value * conversions[unit];
    }

    calculate() {
        try {
            // 获取输入值
            const pieces = parseFloat(this.pieces.value) || 1;
            const thickness = parseFloat(this.thickness.value) || 0;
            const width = parseFloat(this.width.value) || 0;
            const widthFrac = parseFloat(this.widthFraction.value) || 0;
            const length = parseFloat(this.length.value) || 0;
            const lengthFrac = parseFloat(this.lengthFraction.value) || 0;
            const pricePerBF = parseFloat(this.price.value) || 0;

            // 转换为英寸
            const thicknessInches = this.convertToInches(thickness, this.thicknessUnit.value);
            const widthInches = this.convertToInches(width, this.widthUnit.value, widthFrac);
            const lengthInches = this.convertToInches(length, this.lengthUnit.value, lengthFrac);

            // 计算板英尺
            // 公式: (厚度 × 宽度 × 长度) ÷ 144 × 块数
            let boardFeet = 0;
            if (thicknessInches > 0 && widthInches > 0 && lengthInches > 0) {
                boardFeet = (thicknessInches * widthInches * lengthInches) / 144 * pieces;
            }

            // 计算总成本
            const totalCost = boardFeet * pricePerBF;

            // 更新显示
            this.updateResult(this.totalBoardFeet, boardFeet.toFixed(2));
            this.updateResult(this.totalCost, totalCost.toFixed(2));

        } catch (error) {
            console.error('计算错误:', error);
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

    // 保存和加载功能
    togglePin(button) {
        const field = button.dataset.field;
        const isPinned = button.classList.contains('pinned');
        
        if (isPinned) {
            // 取消固定
            button.classList.remove('pinned');
            localStorage.removeItem(`bf_calc_${field}`);
            if (field.includes('Unit')) {
                localStorage.removeItem(`bf_calc_${field}`);
            }
        } else {
            // 固定值
            button.classList.add('pinned');
            this.saveValue(field);
        }
    }

    saveValue(field) {
        let value, unit;
        
        switch(field) {
            case 'pieces':
                value = this.pieces.value;
                break;
            case 'thickness':
                value = this.thickness.value;
                unit = this.thicknessUnit.value;
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
                // 标记为已固定
                const pinButton = document.querySelector(`[data-field="${field}"]`);
                if (pinButton) {
                    pinButton.classList.add('pinned');
                }
                
                // 设置值
                switch(field) {
                    case 'pieces':
                        this.pieces.value = value;
                        break;
                    case 'thickness':
                        this.thickness.value = value;
                        if (unit) this.thicknessUnit.value = unit;
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

    // 按钮功能
    shareResult() {
        const boardFeet = this.totalBoardFeet.textContent;
        const cost = this.totalCost.textContent;
        const shareText = `板英尺计算结果：${boardFeet} 板英尺，总成本：¥${cost}`;
        
        if (navigator.share) {
            navigator.share({
                title: '板英尺计算器结果',
                text: shareText,
                url: window.location.href
            });
        } else {
            // 备用方案：复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('计算结果已复制到剪贴板');
            }).catch(() => {
                // 如果复制失败，显示结果
                alert(shareText);
            });
        }
    }

    reloadCalculator() {
        // 重新加载页面
        window.location.reload();
    }

    clearAllChanges() {
        // 清除所有本地存储
        const keys = Object.keys(localStorage).filter(key => key.startsWith('bf_calc_'));
        keys.forEach(key => localStorage.removeItem(key));
        
        // 重置所有输入
        this.pieces.value = '1';
        this.thickness.value = '';
        this.width.value = '';
        this.widthFraction.value = '';
        this.length.value = '';
        this.lengthFraction.value = '';
        this.price.value = '';
        
        // 重置单位
        this.thicknessUnit.value = 'in';
        this.widthUnit.value = 'in';
        this.lengthUnit.value = 'ft';
        
        // 重置复合输入框
        this.handleUnitChange(this.widthUnit);
        this.handleUnitChange(this.lengthUnit);
        
        // 移除所有固定状态
        this.pinButtons.forEach(button => {
            button.classList.remove('pinned');
        });
        
        // 重新计算
        this.calculate();
        
        this.showNotification('所有设置已重置');
    }

    submitFeedback(isPositive) {
        const button = isPositive ? this.feedbackYes : this.feedbackNo;
        
        // 添加选中效果
        this.feedbackYes.classList.remove('selected');
        this.feedbackNo.classList.remove('selected');
        button.classList.add('selected');
        
        // 保存反馈到本地存储
        localStorage.setItem('bf_calc_feedback', isPositive ? 'positive' : 'negative');
        localStorage.setItem('bf_calc_feedback_date', new Date().toISOString());
        
        // 显示感谢消息
        const message = isPositive ? '感谢您的正面反馈！' : '感谢您的反馈，我们会继续改进。';
        this.showNotification(message);
    }

    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 初始化计算器
document.addEventListener('DOMContentLoaded', () => {
    new BoardFootCalculator();
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('页面错误:', e);
});

// 页面可见性变化时保存状态
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时自动保存当前固定的值
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
