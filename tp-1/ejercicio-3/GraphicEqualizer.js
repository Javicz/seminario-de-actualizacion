class GraphicEqualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Estado interno del componente
    this._data = {
      preset: 'Manual',
      bands: [
        { frequency: '32Hz', db: 0 },
        { frequency: '64Hz', db: 0 },
        { frequency: '130Hz', db: 0 },
        { frequency: '260Hz', db: 0 },
        { frequency: '500Hz', db: 0 },
        { frequency: '1k', db: 0 },
        { frequency: '2k', db: 0 },
        { frequency: '4k', db: 0 },
        { frequency: '8.3k', db: 0 },
        { frequency: '16.5k', db: 0 }
      ]
    };
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  // --- API  ---
  getData() {
    return JSON.parse(JSON.stringify(this._data));
  }

  setData(newData) {
    if (!newData || !Array.isArray(newData.bands)) return;
    this._data = JSON.parse(JSON.stringify(newData));
    this.updateUI(); // Sincroniza la interfaz gráfica de forma atómica
  }

  // --- Renderizado 100% imperativo mediante el DOM ---
  render() {
    // Limpiamos el shadowRoot de cualquier contenido previo
    this.shadowRoot.textContent = '';

    // 1. Estilos encapsulados mediante una etiqueta <style>
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: inline-block;
        font-family: 'Courier New', Courier, monospace;
        background-color: #d4d0c8;
        border: 2px solid;
        border-color: #fff #404040 #404040 #fff;
        padding: 10px;
        user-select: none;
        box-shadow: inset 1px 1px 0px #fff;
      }
      .window-title {
        background: linear-gradient(90deg, #0a246a, #a6caf0);
        color: white;
        padding: 2px 4px;
        font-weight: bold;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .container {
        display: flex;
        gap: 15px;
      }
      .eq-interface {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .top-bar {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      select {
        width: 150px;
        background: white;
        border: 2px solid;
        border-color: #404040 #fff #fff #404040;
      }
      .btn-retro {
        background: #d4d0c8;
        border: 2px solid;
        border-color: #fff #404040 #404040 #fff;
        padding: 2px 6px;
        font-size: 12px;
        cursor: pointer;
      }
      .btn-retro:active {
        border-color: #404040 #fff #fff #404040;
      }
      .bands-container {
        display: flex;
        border: 1px inset #fff;
        background-color: #d4d0c8;
        padding: 5px;
      }
      .band {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 11px;
        width: 45px;
        border: 1px solid #808080;
        padding: 4px 0;
        background: #d4d0c8;
      }
      .slider-wrapper {
        height: 120px;
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
      input[type="range"] {
        writing-mode: vertical-lr;
        direction: rtl;
        vertical-align: middle;
        width: 20px;
        height: 100%;
        cursor: pointer;
      }
      .actions-sidebar {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 80px;
      }
      .actions-sidebar .btn-retro {
        padding: 5px;
        text-align: center;
      }
    `;
    this.shadowRoot.appendChild(style);

    // 2. Título de la Ventana
    const windowTitle = document.createElement('div');
    windowTitle.className = 'window-title';
    windowTitle.textContent = 'Graphic EQ';
    this.shadowRoot.appendChild(windowTitle);

    // 3. Contenedor estructural
    const container = document.createElement('div');
    container.className = 'container';

    // 4. Panel Izquierdo (Controles y ecualizador)
    const eqInterface = document.createElement('div');
    eqInterface.className = 'eq-interface';

    // 5. Barra Superior (Select y botones retro)
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';

    const select = document.createElement('select');
    select.id = 'presetSelect';
    const initialOption = document.createElement('option');
    initialOption.textContent = this._data.preset;
    select.appendChild(initialOption);
    topBar.appendChild(select);

    const btnSave = document.createElement('button');
    btnSave.className = 'btn-retro';
    btnSave.textContent = '💾';
    topBar.appendChild(btnSave);

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-retro';
    btnDelete.style.color = 'red';
    btnDelete.textContent = 'X';
    topBar.appendChild(btnDelete);

    eqInterface.appendChild(topBar);

    // 6. Grid contenedor de las bandas (Le asignamos un ID para adjuntar eventos allí)
    const bandsContainer = document.createElement('div');
    bandsContainer.className = 'bands-container';
    bandsContainer.id = 'bandsContainer';

    // Iteramos por cada banda construyendo sub-nodos explícitos
    this._data.bands.forEach((band, index) => {
      const bandDiv = document.createElement('div');
      bandDiv.className = 'band';
      bandDiv.dataset.index = index;

      const freqLabel = document.createElement('div');
      freqLabel.className = 'freq-label';
      freqLabel.textContent = band.frequency;

      const sliderWrapper = document.createElement('div');
      sliderWrapper.className = 'slider-wrapper';

      const rangeInput = document.createElement('input');
      rangeInput.type = 'range';
      rangeInput.min = '-12';
      rangeInput.max = '12';
      rangeInput.step = '0.5';
      rangeInput.value = band.db;

      sliderWrapper.appendChild(rangeInput);

      const dbLabel = document.createElement('div');
      dbLabel.className = 'db-label';
      dbLabel.textContent = `${band.db >= 0 ? '+' : ''}${band.db}dB`;

      // Encadenar la jerarquía de la banda
      bandDiv.appendChild(freqLabel);
      bandDiv.appendChild(sliderWrapper);
      bandDiv.appendChild(dbLabel);
      
      bandsContainer.appendChild(bandDiv);
    });

    eqInterface.appendChild(bandsContainer);
    container.appendChild(eqInterface);

    // 7. Panel Lateral Derecho (Acciones)
    const actionsSidebar = document.createElement('div');
    actionsSidebar.className = 'actions-sidebar';

    const buttons = ['OK', 'Cancel', 'Audition', 'Help'];
    buttons.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'btn-retro';
      btn.textContent = text;
      actionsSidebar.appendChild(btn);
    });

    container.appendChild(actionsSidebar);
    this.shadowRoot.appendChild(container);
  }

  // --- Gestión de Eventos reactivos ---
  setupEventListeners() {
    // Captura eficiente delegada en el contenedor padre
    this.shadowRoot.getElementById('bandsContainer').addEventListener('input', (event) => {
      if (event.target.matches('input[type="range"]')) {
        const bandElement = event.target.closest('.band');
        const index = parseInt(bandElement.dataset.index, 10);
        const newValue = parseFloat(event.target.value);

        // 1. Modificar el estado en memoria
        this._data.bands[index].db = newValue;

        // 2. Modificar solo el nodo textual del decibelio
        const dbLabel = bandElement.querySelector('.db-label');
        dbLabel.textContent = `${newValue >= 0 ? '+' : ''}${newValue}dB`;
      }
    });
  }

  // --- Sincronización invocada de forma externa mediante setData() ---
  updateUI() {
    const select = this.shadowRoot.getElementById('presetSelect');
    if (select) {
      select.textContent = ''; // Limpieza atómica de nodos
      const option = document.createElement('option');
      option.textContent = this._data.preset;
      select.appendChild(option);
    }

    this._data.bands.forEach((band, index) => {
      const bandElement = this.shadowRoot.querySelector(`.band[data-index="${index}"]`);
      if (bandElement) {
        const input = bandElement.querySelector('input[type="range"]');
        const dbLabel = bandElement.querySelector('.db-label');
        
        if (input) input.value = band.db;
        if (dbLabel) {
          dbLabel.textContent = `${band.db >= 0 ? '+' : ''}${band.db}dB`;
        }
      }
    });
  }
}

// Registro del elemento personalizado
customElements.define('graphic-equalizer', GraphicEqualizer);