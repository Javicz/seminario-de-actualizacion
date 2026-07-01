/**
 * Vista de la Calculadora
 * Maneja el renderizado y las actualizaciones del DOM
 * NO contiene lógica de negocio
 */
export class CalculatorView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.displayElement = null;
        this.titleElement = null;
        this.buttonElements = {};
        
        // Cache de elementos
        this.cacheElements();
    }

    /**
     * Cachear referencias a elementos del DOM
     */
    cacheElements() {
        this.displayElement = this.shadowRoot.getElementById('display');
        this.titleElement = this.shadowRoot.querySelector('.title');
        
        // Botones principales
        this.buttonElements = {
            result: this.shadowRoot.getElementById('btnResult'),
            delete: this.shadowRoot.getElementById('btnDelete')
        };
    }

    /**
     * Renderizar el HTML del componente
     */
    render(title) {
        this.shadowRoot.innerHTML = `
            <style>
                /* ===== ESTILOS DEL COMPONENTE ===== */
                :host {
                    display: inline-block;
                }
                
                .calculator {
                    background: #2d3436;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    max-width: 320px;
                    width: 100%;
                }
                
                .title {
                    color: #dfe6e9;
                    text-align: center;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                    opacity: 0.6;
                }
                
                #display {
                    width: 100%;
                    height: 60px;
                    padding: 10px 15px;
                    font-size: 28px;
                    text-align: right;
                    background: #1a1a2e;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Courier New', monospace;
                    box-sizing: border-box;
                    margin-bottom: 10px;
                    transition: background 0.3s;
                }
                
                #display.error {
                    background: #2d1a1a;
                    color: #ff6b6b;
                }
                
                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 6px;
                }
                
                td {
                    border: none;
                    padding: 0;
                }
                
                button {
                    width: 100%;
                    height: 50px;
                    font-size: 20px;
                    font-weight: bold;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    font-family: Arial, sans-serif;
                }
                
                button:active {
                    transform: scale(0.92);
                }
                
                .num {
                    background: #dfe6e9;
                    color: #2d3436;
                    box-shadow: 0 4px 0 #b2bec3;
                }
                
                .num:active {
                    box-shadow: 0 2px 0 #b2bec3;
                    transform: translateY(2px);
                }
                
                .op {
                    background: #fdcb6e;
                    color: #2d3436;
                    box-shadow: 0 4px 0 #e17055;
                }
                
                .op:active {
                    box-shadow: 0 2px 0 #e17055;
                    transform: translateY(2px);
                }
                
                .eq {
                    background: #0984e3;
                    color: white;
                    box-shadow: 0 4px 0 #0652DD;
                    font-size: 24px;
                }
                
                .eq:active {
                    box-shadow: 0 2px 0 #0652DD;
                    transform: translateY(2px);
                }
                
                #btnDelete {
                    background: #e74c3c;
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    box-shadow: 0 5px 0 #BB3E22;
                    height: 40px;
                }
                
                #btnDelete:active {
                    box-shadow: 0 2px 0 #BB3E22;
                    transform: translateY(3px);
                }
                
                .dot {
                    background: #dfe6e9;
                    color: #2d3436;
                    box-shadow: 0 4px 0 #b2bec3;
                    font-weight: 900;
                }
                
                .dot:active {
                    box-shadow: 0 2px 0 #b2bec3;
                    transform: translateY(2px);
                }
            </style>
            
            <div class="calculator">
                ${title ? `<div class="title">${title}</div>` : ''}
                
                <input id="display" type="text" value="0" disabled>
                
                <table>
                    <tr>
                        <td><button class="num" data-value="7">7</button></td>
                        <td><button class="num" data-value="8">8</button></td>
                        <td><button class="num" data-value="9">9</button></td>
                        <td><button class="op" data-value="+">+</button></td>
                    </tr>
                    <tr>
                        <td><button class="num" data-value="4">4</button></td>
                        <td><button class="num" data-value="5">5</button></td>
                        <td><button class="num" data-value="6">6</button></td>
                        <td><button class="op" data-value="-">-</button></td>
                    </tr>
                    <tr>
                        <td><button class="num" data-value="3">3</button></td>
                        <td><button class="num" data-value="2">2</button></td>
                        <td><button class="num" data-value="1">1</button></td>
                        <td><button class="op" data-value="×">×</button></td>
                    </tr>
                    <tr>
                        <td><button class="num" data-value="0">0</button></td>
                        <td><button class="dot" data-value=".">.</button></td>
                        <td><button id="btnResult" class="eq">=</button></td>
                        <td><button class="op" data-value="÷">÷</button></td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <button id="btnDelete">Borrar</button>
                        </td>
                    </tr>
                </table>
            </div>
        `;

        // Re-cachear elementos después del renderizado
        this.cacheElements();
    }

    /**
     * Actualizar el display con el estado del modelo
     */
    updateDisplay(state) {
        if (!this.displayElement) return;
        
        this.displayElement.value = state.displayValue;
        
        // Manejar estado de error
        if (state.error) {
            this.displayElement.classList.add('error');
        } else {
            this.displayElement.classList.remove('error');
        }
    }

    /**
     * Mostrar estado de error
     */
    showError() {
        if (!this.displayElement) return;
        this.displayElement.value = 'Error';
        this.displayElement.classList.add('error');
    }

    /**
     * Limpiar estado de error
     */
    clearError() {
        if (!this.displayElement) return;
        this.displayElement.classList.remove('error');
    }

    /**
     * Obtener el display
     */
    getDisplay() {
        return this.displayElement;
    }

    /**
     * Agregar listener a la tabla (delegación de eventos)
     */
    addTableListener(callback) {
        const table = this.shadowRoot.querySelector('table');
        if (table) {
            table.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (button) {
                    callback(button);
                }
            });
        }
    }

    /**
     * Limpiar el componente
     */
    destroy() {
        // Limpiar referencias
        this.displayElement = null;
        this.titleElement = null;
        this.buttonElements = {};
        this.shadowRoot.innerHTML = '';
    }
}