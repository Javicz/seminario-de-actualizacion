
export class CalculatorModel {
    constructor() {
        this.expression = '';
        this.resultDisplayed = false;
        this.lastResult = null;
    }

    /**
     * Agregar un valor a la expresión
     */
    addValue(value) {
        // Si ya se mostró un resultado y presionamos un número, empezar de nuevo
        if (this.resultDisplayed && !isNaN(value)) {
            this.expression = '';
            this.resultDisplayed = false;
        }

        const lastChar = this.expression.slice(-1);
        const operators = ['+', '-', '×', '÷'];

        // Prevenir operadores duplicados consecutivos
        if (operators.includes(lastChar) && operators.includes(value)) {
            this.expression = this.expression.slice(0, -1) + value;
        } else {
            this.expression += value;
        }

        return this.getState();
    }

    /**
     * Calcular el resultado de la expresión
     */
    calculate() {
        if (!this.expression) {
            return { value: '0', error: false };
        }

        try {
            let expr = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');

            const result = new Function(`return (${expr})`)();

            if (!isFinite(result)) {
                throw new Error('División por cero');
            }

            const formatted = Number.isInteger(result) 
                ? result.toString() 
                : result.toFixed(6).replace(/\.?0+$/, '');

            this.expression = formatted;
            this.resultDisplayed = true;
            this.lastResult = formatted;

            return { value: formatted, error: false };

        } catch (error) {
            this.expression = '';
            this.resultDisplayed = false;
            this.lastResult = null;
            return { value: 'Error', error: true };
        }
    }

    /**
     * Borrar toda la expresión
     */
    clear() {
        this.expression = '';
        this.resultDisplayed = false;
        this.lastResult = null;
        return this.getState();
    }

    /**
     * Eliminar el último carácter
     */
    backspace() {
        if (this.resultDisplayed) {
            this.expression = '';
            this.resultDisplayed = false;
        } else {
            this.expression = this.expression.slice(0, -1);
        }
        return this.getState();
    }

    /**
     * Obtener el estado actual del modelo
     */
    getState() {
        return {
            expression: this.expression,
            displayValue: this.expression || '0',
            resultDisplayed: this.resultDisplayed,
            lastResult: this.lastResult,
            error: false
        };
    }

    /**
     * Resetear el modelo a estado inicial
     */
    reset() {
        this.expression = '';
        this.resultDisplayed = false;
        this.lastResult = null;
        return this.getState();
    }
}