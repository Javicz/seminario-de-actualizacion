export class CalculatorView {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.displayElement = null;
        this.titleElement = null;
        this.calculatorContainer = null;
        this.buttonElements = {};
    }

    /**
     * Renderizar el HTML del componente usando createElement()
     */
    render(title) {
        // ===== 1. LIMPIAR SHADOW ROOT =====
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }

        // ===== 2. CREAR ESTILOS =====
        const style = this._createStyles();
        this.shadowRoot.appendChild(style);

        // ===== 3. CREAR CONTENEDOR PRINCIPAL =====
        const calculatorDiv = this._createElement('div', {
            className: 'calculator'
        });
        this.shadowRoot.appendChild(calculatorDiv);

        // ===== 4. CREAR TÍTULO =====
        if (title) {
            const titleDiv = this._createElement('div', {
                className: 'title',
                textContent: title
            });
            calculatorDiv.appendChild(titleDiv);
            this.titleElement = titleDiv;
        }

        // ===== 5. CREAR DISPLAY =====
        const display = this._createElement('input', {
            id: 'display',
            type: 'text',
            value: '0',
            disabled: true,
            attributes: { disabled: '' }
        });
        calculatorDiv.appendChild(display);
        this.displayElement = display;

        // ===== 6. CREAR TABLA DE BOTONES =====
        const table = this._createTable();
        calculatorDiv.appendChild(table);

        // ===== 7. CACHEAR ELEMENTOS =====
        this.cacheElements();
    }

    /**
     * Crear los estilos del componente
     */
    _createStyles() {
        const style = document.createElement('style');
        style.textContent = `
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
        `;
        return style;
    }

    /**
     * Helper para crear elementos con atributos
     */
    _createElement(tag, props) {
        const el = document.createElement(tag);
        
        if (props) {
            Object.keys(props).forEach(key => {
                if (key === 'textContent') {
                    el.textContent = props[key];
                } else if (key === 'attributes') {
                    Object.keys(props.attributes).forEach(attrKey => {
                        el.setAttribute(attrKey, props.attributes[attrKey]);
                    });
                } else if (key === 'className') {
                    el.className = props[key];
                } else {
                    el[key] = props[key];
                }
            });
        }
        
        return el;
    }

    /**
     * Crear la tabla de botones
     */
    _createTable() {
        const table = document.createElement('table');
        
        // Definición de botones: [fila][columna]
        const rows = [
            // Fila 1: 7, 8, 9, +
            [
                { text: '7', className: 'num', dataValue: '7' },
                { text: '8', className: 'num', dataValue: '8' },
                { text: '9', className: 'num', dataValue: '9' },
                { text: '+', className: 'op', dataValue: '+' }
            ],
            // Fila 2: 4, 5, 6, -
            [
                { text: '4', className: 'num', dataValue: '4' },
                { text: '5', className: 'num', dataValue: '5' },
                { text: '6', className: 'num', dataValue: '6' },
                { text: '-', className: 'op', dataValue: '-' }
            ],
            // Fila 3: 3, 2, 1, ×
            [
                { text: '3', className: 'num', dataValue: '3' },
                { text: '2', className: 'num', dataValue: '2' },
                { text: '1', className: 'num', dataValue: '1' },
                { text: '×', className: 'op', dataValue: '×' }
            ],
            // Fila 4: 0, ., =, ÷
            [
                { text: '0', className: 'num', dataValue: '0' },
                { text: '.', className: 'dot', dataValue: '.' },
                { text: '=', className: 'eq', dataValue: null, id: 'btnResult' },
                { text: '÷', className: 'op', dataValue: '÷' }
            ],
            // Fila 5: Botón Borrar (colspan 4)
            [
                { text: 'Borrar', className: '', dataValue: null, id: 'btnDelete', colspan: 4 }
            ]
        ];

        // Crear filas y celdas
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const rowData = rows[rowIndex];
            const tr = document.createElement('tr');

            for (let colIndex = 0; colIndex < rowData.length; colIndex++) {
                const btnData = rowData[colIndex];
                const td = document.createElement('td');

                // Aplicar colspan si existe
                if (btnData.colspan) {
                    td.setAttribute('colspan', btnData.colspan);
                }

                // Crear el botón
                const button = document.createElement('button');
                button.textContent = btnData.text;

                // Asignar clase
                if (btnData.className) {
                    button.className = btnData.className;
                }

                // Asignar data-value
                if (btnData.dataValue !== null && btnData.dataValue !== undefined) {
                    button.setAttribute('data-value', btnData.dataValue);
                }

                // Asignar ID si existe
                if (btnData.id) {
                    button.id = btnData.id;
                }

                // Cachear referencia del botón
                if (btnData.id) {
                    this.buttonElements[btnData.id] = button;
                }

                td.appendChild(button);
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }

        return table;
    }

    /**
     * Cachear referencias a elementos del DOM
     */
    cacheElements() {
        this.displayElement = this.shadowRoot.getElementById('display');
        this.titleElement = this.shadowRoot.querySelector('.title');
        this.calculatorContainer = this.shadowRoot.querySelector('.calculator');
        
        // Actualizar referencias de botones
        this.buttonElements = {
            result: this.shadowRoot.getElementById('btnResult'),
            delete: this.shadowRoot.getElementById('btnDelete')
        };
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
        this.displayElement = null;
        this.titleElement = null;
        this.calculatorContainer = null;
        this.buttonElements = {};
        
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
    }
}