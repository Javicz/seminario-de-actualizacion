import { CalculatorModel } from '../models/CalculatorModel.js';
import { CalculatorView } from '../views/CalculatorView.js';
import { CalculatorController } from '../controllers/CalculatorController.js';

class CalculatorComponent extends HTMLElement {
    
    constructor() {
        super();
        
        // Crear Shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Inicializar MVC
        this.model = new CalculatorModel();
        this.view = new CalculatorView(this.shadowRoot);
        this.controller = new CalculatorController(this.model, this.view);
        
        // Renderizar vista
        const title = this.getAttribute('title') || '';
        this.view.render(title);
        
        // Inicializar controlador
        this.controller.init();
    }

    static get observedAttributes() {
        return ['title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title' && oldValue !== newValue) {
            const title = newValue || '';
            this.view.render(title);
            this.controller.destroy();
            this.controller = new CalculatorController(this.model, this.view);
            this.controller.init();
        }
    }

    connectedCallback() {
        this.controller.updateView();
    }

    disconnectedCallback() {
        this.controller.destroy();
        this.view.destroy();
    }

    // ===== MÉTODOS PÚBLICOS =====
    reset() {
        this.controller.reset();
    }

    getState() {
        return this.model.getState();
    }

    setValue(value) {
        this.model.expression = value;
        this.controller.updateView();
    }
}

// Registrar el componente
customElements.define('x-calculator', CalculatorComponent);

export default CalculatorComponent;

// Mensaje en consola
console.log('🧮 Calculadora MVC cargada (sin innerHTML)');
console.log('  document.querySelector("x-calculator").reset()');
console.log('  document.querySelector("x-calculator").getState()');