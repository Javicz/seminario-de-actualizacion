import { CalculatorModel } from '../models/CalculatorModel.js';
import { CalculatorView } from '../views/CalculatorView.js';
import { CalculatorController } from '../controllers/CalculatorController.js';

/**
 * WebComponent de la Calculadora
 * Orquesta Modelo-Vista-Controlador
 * Implementa la interfaz mínima de WebComponents
 */
class CalculatorComponent extends HTMLElement {
    
    // ============ 1. CONSTRUCTOR ============
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

    // ============ 2. ATRIBUTOS OBSERVABLES ============
    static get observedAttributes() {
        return ['title'];
    }

    // ============ 3. MANEJO DE ATRIBUTOS ============
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title' && oldValue !== newValue) {
            // Re-renderizar con nuevo título
            const title = newValue || '';
            this.view.render(title);
            // Re-inicializar controlador (los listeners se pierden al re-renderizar)
            this.controller.destroy();
            this.controller = new CalculatorController(this.model, this.view);
            this.controller.init();
        }
    }

    // ============ 4. CICLO DE VIDA ============
    connectedCallback() {
        console.log('✅ Calculadora conectada al DOM');
        // Actualizar display
        this.controller.updateView();
    }

    disconnectedCallback() {
        console.log('🔄 Calculadora desconectada del DOM');
        // Limpiar recursos
        this.controller.destroy();
        this.view.destroy();
    }

    // ============ 5. MÉTODOS PÚBLICOS ============
    /**
     * Resetear la calculadora
     */
    reset() {
        this.controller.reset();
    }

    /**
     * Obtener el estado actual
     */
    getState() {
        return this.model.getState();
    }

    /**
     * Establecer valor (para pruebas)
     */
    setValue(value) {
        this.model.expression = value;
        this.controller.updateView();
    }
}

// ============ 6. REGISTRAR EL COMPONENTE ============
customElements.define('x-calculator', CalculatorComponent);

// ============ 7. EXPORTAR ============
export default CalculatorComponent;

// ============ 8. CONSOLA ============
console.log('🧮 Calculadora MVC cargada');
console.log('  document.querySelector("x-calculator").reset()');
console.log('  document.querySelector("x-calculator").getState()');