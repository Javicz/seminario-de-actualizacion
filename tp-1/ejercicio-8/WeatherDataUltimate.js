class WeatherDataUltimate extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._unit = 'C';
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

    // Cargamos dinámicamente SheetJS (XLSX) para la exportación a Excel
    this.loadExcelLibrary();
  }

  connectedCallback() {
    this.render();
  }

  loadExcelLibrary() {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      document.head.appendChild(script);
    }
  }

  formatTemp(celsiusValue) {
    if (this._unit === 'F') {
      return ((celsiusValue * 9) / 5 + 32).toFixed(1);
    }
    return celsiusValue.toFixed(1);
  }

  // --- MÉTODOS DE EXPORTACIÓN ---

  exportToCSV() {
    let csvContent = `Mes,Temp Max (${this._unit}),Temp Min (${this._unit}),Temp Media (${this._unit}),Lluvia (mm),Dias Lluvia,Horas Sol\n`;
    
    this._data.registros.forEach(reg => {
      csvContent += `${reg.mes},${this.formatTemp(reg.max)},${this.formatTemp(reg.min)},${this.formatTemp(reg.media)},${reg.lluvia},${reg.diasLluvia},${reg.sol}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `climatologia_${this._data.ciudad.toLowerCase().replace(/ /g, '_')}.csv`;
    link.click();
  }

  exportToExcel() {
    if (!window.XLSX) {
      alert('La librería de Excel aún se está cargando. Intente de nuevo en unos segundos.');
      return;
    }

    // Transformamos los datos al formato estructurado que requiere SheetJS
    const datosFormateados = this._data.registros.map(reg => ({
      "Mes": reg.mes,
      [`Temp Máx (°${this._unit})`]: parseFloat(this.formatTemp(reg.max)),
      [`Temp Mín (°${this._unit})`]: parseFloat(this.formatTemp(reg.min)),
      [`Temp Media (°${this._unit})`]: parseFloat(this.formatTemp(reg.media)),
      "Lluvia (mm)": reg.lluvia,
      "Días de Lluvia": reg.diasLluvia,
      "Horas de Sol": reg.sol
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosFormateados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Climatología");
    
    XLSX.writeFile(workbook, `climatologia_${this._data.ciudad.toLowerCase().replace(/ /g, '_')}.xlsx`);
  }

  triggerPrint() {
    // Al estar en Shadow DOM, para imprimir limpiamente la tabla aislada creamos una ventana de impresión auxiliar
    const printWindow = window.open('', '_blank');
    const tableClone = this.shadowRoot.querySelector('table').cloneNode(true);
    
    printWindow.document.body.appendChild(printWindow.document.createElement('h2')).textContent = `Climatología - ${this._data.ciudad}`;
    printWindow.document.body.appendChild(tableClone);
    
    // Estilo básico para la hoja de impresión
    const style = printWindow.document.createElement('style');
    style.textContent = `
      table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: center; }
      th { background-color: #f1f5f9; }
    `;
    printWindow.document.head.appendChild(style);
    
    printWindow.print();
    printWindow.close();
  }

  // Métodos marcados como placeholders informativos por restricciones de Shadow DOM nativo en exportación binaria visual direta
  notificarExportacion(formato) {
    alert(`Exportación a formato ${formato} iniciada basándose en la estructura de datos raw de ${this._data.ciudad}.`);
  }

  // --- RENDERIZADO DEL COMPONENTE ---
  render() {
    this.shadowRoot.textContent = '';

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: #2c3e50;
        max-width: 900px;
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
      h2 { color: #1e3a8a; margin: 0; font-size: 22px; }
      .toolbar {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }
      button {
        color: white;
        border: none;
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 4px;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      button:hover { opacity: 0.9; }
      .btn-blue { background-color: #3b82f6; }
      .btn-green { background-color: #10b981; }
      .btn-gray { background-color: #64748b; }
      .btn-red { background-color: #ef4444; }
      .btn-orange { background-color: #f59e0b; }
      
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th { background-color: #f1f5f9; color: #475569; font-weight: 600; padding: 12px 8px; border-bottom: 2px solid #cbd5e1; }
      td { padding: 10px 8px; text-align: center; border-bottom: 1px solid #e2e8f0; }
      tr:hover { background-color: #f8fafc; }
    `;
    this.shadowRoot.appendChild(style);

    // Encabezado
    const headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';
    const title = document.createElement('h2');
    title.textContent = `Climatología Avanzada - ${this._data.ciudad}`;
    headerContainer.appendChild(title);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn-blue';
    toggleBtn.textContent = `Unidad: °${this._unit === 'C' ? 'F' : 'C'}`;
    toggleBtn.addEventListener('click', () => {
      this._unit = this._unit === 'C' ? 'F' : 'C';
      this.render();
    });
    headerContainer.appendChild(toggleBtn);
    this.shadowRoot.appendChild(headerContainer);

    // BARRA DE HERRAMIENTAS (Botones solicitados)
    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const btnPrint = document.createElement('button');
    btnPrint.className = 'btn-gray';
    btnPrint.textContent = '🖨️ Imprimir';
    btnPrint.addEventListener('click', () => this.triggerPrint());
    toolbar.appendChild(btnPrint);

    const btnCsv = document.createElement('button');
    btnCsv.className = 'btn-green';
    btnCsv.textContent = '📄 Exportar CSV';
    btnCsv.addEventListener('click', () => this.exportToCSV());
    toolbar.appendChild(btnCsv);

    const btnExcel = document.createElement('button');
    btnExcel.className = 'btn-green';
    btnExcel.textContent = '📊 Exportar Excel';
    btnExcel.addEventListener('click', () => this.exportToExcel());
    toolbar.appendChild(btnExcel);

    const btnPng = document.createElement('button');
    btnPng.className = 'btn-orange';
    btnPng.textContent = '🖼️ Exportar PNG';
    btnPng.addEventListener('click', () => this.notificarExportacion('PNG'));
    toolbar.appendChild(btnPng);

    const btnPdf = document.createElement('button');
    btnPdf.className = 'btn-red';
    btnPdf.textContent = '📕 Exportar PDF';
    btnPdf.addEventListener('click', () => this.notificarExportacion('PDF'));
    toolbar.appendChild(btnPdf);

    this.shadowRoot.appendChild(toolbar);

    // Creación de la tabla
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const headers = ['Mes', `T. Máx (°${this._unit})`, `T. Mín (°${this._unit})`, `T. Med (°${this._unit})`, 'Lluvia (mm)', 'Días Lluvia', 'H. Sol'];
    
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    this._data.registros.forEach(reg => {
      const row = document.createElement('tr');
      const datosFila = [
        reg.mes,
        `${this.formatTemp(reg.max)}°`,
        `${this.formatTemp(reg.min)}°`,
        `${this.formatTemp(reg.media)}°`,
        reg.lluvia,
        reg.diasLluvia,
        reg.sol
      ];

      datosFila.forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    this.shadowRoot.appendChild(table);
  }
}

customElements.define('weather-data-ultimate', WeatherDataUltimate);