class WeatherDataExtended extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Propiedad de control para la unidad de temperatura actual ('C' o 'F')
    this._unit = 'C';

    // CORRECCIÓN: Se cambiaron los "=" por ":" para evitar el SyntaxError
    this._data = {
      ciudad: "Mar del Plata",
      registros: [
        { mes: "Ene", max: 26.3, min: 14.3, media: 20.3, lluvia: 94, diasLluvia: 9, sol: 288 },
        { mes: "Feb", max: 25.4, min: 14.1, media: 19.7, lluvia: 84, diasLluvia: 8, sol: 254 },
        { mes: "Mar", max: 23.4, min: 12.5, media: 17.9, lluvia: 101, diasLluvia: 9, sol: 232 },
        { mes: "Abr", max: 19.5, min: 9.1,  media: 14.3, lluvia: 96, diasLluvia: 9, sol: 177 },
        { mes: "May", max: 16.0, min: 6.3,  media: 11.1, lluvia: 83, diasLluvia: 8, sol: 145 },
        { mes: "Jun", max: 12.8, min: 3.7,  media: 8.2,  lluvia: 74, diasLluvia: 8, sol: 117 },
        { mes: "Jul", max: 12.2, min: 3.2,  media: 7.7,  lluvia: 76, diasLluvia: 9, sol: 124 },
        { mes: "Ago", max: 14.1, min: 4.0,  media: 9.0,  lluvia: 65, diasLluvia: 8, sol: 158 },
        { mes: "Sep", max: 16.1, min: 5.4,  media: 10.7, lluvia: 73, diasLluvia: 7, sol: 189 },
        { mes: "Oct", max: 19.4, min: 8.1,  media: 13.7, lluvia: 109, diasLluvia: 10, sol: 223 },
        { mes: "Nov", max: 22.2, min: 10.4, media: 16.3, lluvia: 98, diasLluvia: 9, sol: 252 },
        { mes: "Dic", max: 24.9, min: 12.8, media: 18.8, lluvia: 92, diasLluvia: 9, sol: 275 }
      ]
    };

    this.handleUnitToggle = this.handleUnitToggle.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  formatTemp(celsiusValue) {
    if (this._unit === 'F') {
      var fahrenheit = (celsiusValue * 9) / 5 + 32;
      return fahrenheit.toFixed(1) + '°F';
    }
    return celsiusValue.toFixed(1) + '°C';
  }

  getTemperaturesAverage() {
    var total = this._data.registros.length;
    if (total === 0) return { maxPromedio: 0, minPromedio: 0, mediaPromedio: 0 };

    var sumas = this._data.registros.reduce(function(acc, reg) {
      acc.max += reg.max;
      acc.min += reg.min;
      acc.media += reg.media;
      return acc;
    }, { max: 0, min: 0, media: 0 });

    return {
      ciudad: this._data.ciudad,
      promedioTemperaturaMaxima: parseFloat((sumas.max / total).toFixed(1)),
      promedioTemperaturaMinima: parseFloat((sumas.min / total).toFixed(1)),
      promedioTemperaturaMedia: parseFloat((sumas.media / total).toFixed(1))
    };
  }

  getData() {
    return JSON.parse(JSON.stringify(this._data));
  }

  setData(newData) {
    if (!newData || !Array.isArray(newData.registros)) return;
    this._data = JSON.parse(JSON.stringify(newData));
    this.render();
  }

  handleUnitToggle() {
    this._unit = this._unit === 'C' ? 'F' : 'C';
    this.render();
  }

  render() {
    this.shadowRoot.textContent = '';

    var style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: #2c3e50;
        max-width: 850px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        padding: 24px;
        border: 1px solid #e2e8f0;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #3b82f6;
        padding-bottom: 12px;
        margin-bottom: 15px;
      }
      h2 {
        color: #1e3a8a;
        margin: 0;
        font-size: 22px;
      }
      .btn-toggle {
        background-color: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn-toggle:hover {
        background-color: #1d4ed8;
      }
      .table-wrapper {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }
      th {
        background-color: #f1f5f9;
        color: #475569;
        font-weight: 600;
        padding: 12px 8px;
        border-bottom: 2px solid #cbd5e1;
      }
      td {
        padding: 10px 8px;
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
      }
      tr:hover {
        background-color: #f8fafc;
      }
      .max { color: #dc2626; font-weight: 600; }
      .min { color: #2563eb; font-weight: 600; }
      .med { color: #16a34a; font-weight: 600; }
      .lluvia { color: #0284c7; }
      .sol { color: #d97706; }
    `;
    this.shadowRoot.appendChild(style);

    var headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';

    var title = document.createElement('h2');
    title.textContent = 'Climatología Completa - ' + this._data.ciudad;
    headerContainer.appendChild(title);

    var toggleButton = document.createElement('button');
    toggleButton.className = 'btn-toggle';
    toggleButton.textContent = 'Cambiar a °' + (this._unit === 'C' ? 'F' : 'C');
    toggleButton.addEventListener('click', this.handleUnitToggle);
    headerContainer.appendChild(toggleButton);

    this.shadowRoot.appendChild(headerContainer);

    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';

    var table = document.createElement('table');
    
    var headerRow = document.createElement('tr');
    var headers = [
      'Mes', 
      'T. Máx (°' + this._unit + ')', 
      'T. Mín (°' + this._unit + ')', 
      'T. Med (°' + this._unit + ')', 
      'Lluvia (mm)', 
      'Días Lluvia', 
      'H. Sol'
    ];
    
    headers.forEach(function(text) {
      var th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    this._data.registros.forEach(function(reg) {
      var row = document.createElement('tr');

      var cellMes = document.createElement('td');
      cellMes.textContent = reg.mes;

      var cellMax = document.createElement('td');
      cellMax.className = 'max';
      cellMax.textContent = this.formatTemp(reg.max);

      var cellMin = document.createElement('td');
      cellMin.className = 'min';
      cellMin.textContent = this.formatTemp(reg.min);

      var cellMed = document.createElement('td');
      cellMed.className = 'med';
      cellMed.textContent = this.formatTemp(reg.media);

      var cellLluvia = document.createElement('td');
      cellLluvia.className = 'lluvia';
      cellLluvia.textContent = reg.lluvia;

      var cellDias = document.createElement('td');
      cellDias.textContent = reg.diasLluvia;

      var cellSol = document.createElement('td');
      cellSol.className = 'sol';
      cellSol.textContent = reg.sol;

      row.appendChild(cellMes);
      row.appendChild(cellMax);
      row.appendChild(cellMin);
      row.appendChild(cellMed);
      row.appendChild(cellLluvia);
      row.appendChild(cellDias);
      row.appendChild(cellSol);
      
      table.appendChild(row);
    }.bind(this));

    wrapper.appendChild(table);
    this.shadowRoot.appendChild(wrapper);
  }
}

customElements.define('weather-data-extended', WeatherDataExtended);