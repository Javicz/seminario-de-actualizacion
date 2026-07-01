
export class CalculatorController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isError = false;
        this.errorTimeout = null;
        
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleKeyboard = this.handleKeyboard.bind(this);
        this.updateView = this.updateView.bind(this);
    }

    /**
     * Inicializar el controlador
     */
    init() {
        this.view.addTableListener(this.handleButtonClick);
        document.addEventListener('keydown', this.handleKeyboard);
        this.updateView();
    }

    /**
     * Manejar click en botones
     */
    handleButtonClick(button) {
        if (this.isError) return;

        const value = button.dataset.value;
        const buttonId = button.id;

        this.view.clearError();

        if (buttonId === 'btnResult') {
            this.handleCalculate();
        } else if (buttonId === 'btnDelete') {
            this.handleClear();
        } else if (value !== undefined) {
            this.handleAddValue(value);
        }
    }

    /**
     * Manejar adición de valor
     */
    handleAddValue(value) {
        const state = this.model.addValue(value);
        this.updateView(state);
    }

    /**
     * Manejar cálculo
     */
    handleCalculate() {
        const result = this.model.calculate();
        
        if (result.error) {
            this.isError = true;
            this.view.showError();
            
            if (this.errorTimeout) {
                clearTimeout(this.errorTimeout);
            }
            this.errorTimeout = setTimeout(() => {
                this.isError = false;
                this.view.clearError();
                this.model.clear();
                this.updateView();
                this.errorTimeout = null;
            }, 1500);
        } else {
            this.updateView(result);
        }
    }

    /**
     * Manejar borrado
     */
    handleClear() {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
        this.isError = false;
        const state = this.model.clear();
        this.view.clearError();
        this.updateView(state);
    }

    /**
     * Manejar backspace
     */
    handleBackspace() {
        if (this.isError) return;
        const state = this.model.backspace();
        this.updateView(state);
    }

    /**
     * Manejar teclado
     */
    handleKeyboard(event) {
        const key = event.key;
        
        const validKeys = ['0','1','2','3','4','5','6','7','8','9','.',
                          '+','-','*','/','Enter','Backspace','Delete','Escape'];
        if (validKeys.includes(key)) {
            event.preventDefault();
        }

        switch(key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                this.handleAddValue(key);
                break;
            case '.':
                this.handleAddValue('.');
                break;
            case '+':
                this.handleAddValue('+');
                break;
            case '-':
                this.handleAddValue('-');
                break;
            case '*':
                this.handleAddValue('×');
                break;
            case '/':
                this.handleAddValue('÷');
                break;
            case 'Enter':
                this.handleCalculate();
                break;
            case 'Backspace':
                this.handleBackspace();
                break;
            case 'Delete':
            case 'Escape':
                this.handleClear();
                break;
        }
    }

    /**
     * Actualizar la vista
     */
    updateView(state) {
        if (!state) {
            state = this.model.getState();
        }
        this.view.updateDisplay(state);
    }

    /**
     * Resetear la calculadora
     */
    reset() {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
        this.isError = false;
        const state = this.model.reset();
        this.view.clearError();
        this.updateView(state);
    }

    /**
     * Destruir el controlador
     */
    destroy() {
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}