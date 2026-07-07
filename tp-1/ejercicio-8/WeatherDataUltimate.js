class WeatherDataExtended extends HTMLElement {
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

    // Bind de métodos
    this.handleUnitToggle = this.handleUnitToggle.bind(this);
    this.handlePrint = this.handlePrint.bind(this);
    this.handleExportPNG = this.handleExportPNG.bind(this);
    this.handleExportCSV = this.handleExportCSV.bind(this);
    this.handleExportPDF = this.handleExportPDF.bind(this);
    this.handleExportExcel = this.handleExportExcel.bind(this);
  }

  connectedCallback() {
    // Cargar SheetJS solo si se necesita
    this.loadSheetJSLibrary();
    this.render();
  }

  loadSheetJSLibrary() {
    if (typeof XLSX === 'undefined') {
      var script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // ... (resto de métodos sin cambios) ...

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

  

  handlePrint() {
    window.print();
  }

  handleExportPNG() {
    // Crear un canvas y renderizar el componente
    var container = this.shadowRoot.querySelector('.component-container');
    if (!container) {
      console.error('No se encontró el contenedor para exportar');
      return;
    }

    // Usar html2canvas para capturar el componente
    this.loadHtml2CanvasLibrary(function() {
      html2canvas(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      }).then(function(canvas) {
        var link = document.createElement('a');
        link.download = 'datos_meteorologicos_' + this._data.ciudad + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }.bind(this)).catch(function(error) {
        console.error('Error al exportar PNG:', error);
        alert('Error al exportar PNG. Por favor, intente de nuevo.');
      });
    }.bind(this));
  }

  loadHtml2CanvasLibrary(callback) {
    if (typeof html2canvas !== 'undefined') {
      callback();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = callback;
    script.onerror = function() {
      console.error('Error al cargar html2canvas');
      alert('No se pudo cargar la librería para exportar PNG. Verifique su conexión.');
    };
    document.head.appendChild(script);
  }

  handleExportCSV() {
    // Construir CSV manualmente
    var csvRows = [];
    var headers = ['Mes', 'Temp Max (°' + this._unit + ')', 'Temp Min (°' + this._unit + ')', 
                   'Temp Med (°' + this._unit + ')', 'Lluvia (mm)', 'Días Lluvia', 'Horas Sol'];
    csvRows.push(headers.join(','));

    this._data.registros.forEach(function(reg) {
      var row = [
        reg.mes,
        this.formatTemp(reg.max).replace('°F', '').replace('°C', ''),
        this.formatTemp(reg.min).replace('°F', '').replace('°C', ''),
        this.formatTemp(reg.media).replace('°F', '').replace('°C', ''),
        reg.lluvia,
        reg.diasLluvia,
        reg.sol
      ];
      csvRows.push(row.join(','));
    }.bind(this));

    // Agregar promedios al final
    var promedios = this.getTemperaturesAverage();
    var promedioRow = [
      'Promedios',
      promedios.promedioTemperaturaMaxima,
      promedios.promedioTemperaturaMinima,
      promedios.promedioTemperaturaMedia,
      '', '', ''
    ];
    csvRows.push(promedioRow.join(','));

    // Descargar CSV
    var csvString = csvRows.join('\n');
    var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'datos_meteorologicos_' + this._data.ciudad + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  handleExportPDF() {
    // Exportar como PDF usando window.print() con estilos optimizados
    // Primero guardamos el estado actual
    var originalTitle = document.title;
    document.title = 'Datos Meteorológicos - ' + this._data.ciudad;

    // Añadir estilos específicos para impresión
    var printStyles = document.createElement('style');
    printStyles.id = 'print-styles';
    printStyles.textContent = `
      @media print {
        body { 
          margin: 0; 
          padding: 20px; 
          background: white !important;
        }
        .no-print { 
          display: none !important; 
        }
        weather-data-extended {
          max-width: 100% !important;
          box-shadow: none !important;
          border: 1px solid #ccc !important;
        }
        .btn-container {
          display: none !important;
        }
        .table-wrapper {
          overflow: visible !important;
        }
        table {
          font-size: 10px !important;
        }
        th, td {
          padding: 4px !important;
        }
      }
    `;
    document.head.appendChild(printStyles);

    // Ejecutar impresión
    window.print();

    // Limpiar después de imprimir (con setTimeout para asegurar que la impresión haya terminado)
    setTimeout(function() {
      var stylesToRemove = document.getElementById('print-styles');
      if (stylesToRemove) {
        stylesToRemove.parentNode.removeChild(stylesToRemove);
      }
      document.title = originalTitle;
    }, 1000);
  }

  handleExportExcel() {
    // Verificar que la librería esté cargada
    if (typeof XLSX === 'undefined') {
      alert('La librería para exportar Excel se está cargando. Por favor, intente de nuevo en unos segundos.');
      this.loadSheetJSLibrary();
      // Intentar nuevamente después de un tiempo
      var self = this;
      setTimeout(function() {
        self.handleExportExcel();
      }, 3000);
      return;
    }

    try {
      // Preparar datos para Excel
      var excelData = [];
      
      // Headers
      excelData.push(['Mes', 'Temp Max (°' + this._unit + ')', 'Temp Min (°' + this._unit + ')', 
                     'Temp Med (°' + this._unit + ')', 'Lluvia (mm)', 'Días Lluvia', 'Horas Sol']);

      // Datos
      this._data.registros.forEach(function(reg) {
        var row = [
          reg.mes,
          parseFloat(this.formatTemp(reg.max).replace('°F', '').replace('°C', '')),
          parseFloat(this.formatTemp(reg.min).replace('°F', '').replace('°C', '')),
          parseFloat(this.formatTemp(reg.media).replace('°F', '').replace('°C', '')),
          reg.lluvia,
          reg.diasLluvia,
          reg.sol
        ];
        excelData.push(row);
      }.bind(this));

      // Promedios
      var promedios = this.getTemperaturesAverage();
      excelData.push([]); // Fila vacía
      excelData.push(['Promedios', 
        promedios.promedioTemperaturaMaxima,
        promedios.promedioTemperaturaMinima,
        promedios.promedioTemperaturaMedia,
        '', '', ''
      ]);

      // Crear libro y hoja de trabajo
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Ajustar anchos de columna
      var colWidths = [
        { wch: 10 }, // Mes
        { wch: 15 }, // Temp Max
        { wch: 15 }, // Temp Min
        { wch: 15 }, // Temp Med
        { wch: 15 }, // Lluvia
        { wch: 15 }, // Días Lluvia
        { wch: 15 }  // Horas Sol
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Datos Meteorológicos');
      
      // Descargar archivo
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var blob = new Blob([wbout], { type: 'application/octet-stream' });
      var link = document.createElement('a');
      var url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'datos_meteorologicos_' + this._data.ciudad + '.xlsx';
      link.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar Excel. Por favor, asegúrese de que la librería SheetJS esté cargada correctamente.');
    }
  }

  render() {
    this.shadowRoot.textContent = '';

    var style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        color: #2c3e50;
        max-width: 950px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        padding: 24px;
        border: 1px solid #e2e8f0;
      }
      .component-container {
        width: 100%;
      }
      .header-container {
        display: flex;
        flex-wrap: wrap;
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
      .btn-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
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
      .btn-export {
        background-color: #10b981;
        color: white;
        border: none;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn-export:hover {
        background-color: #059669;
      }
      .btn-export.print {
        background-color: #6366f1;
      }
      .btn-export.print:hover {
        background-color: #4f46e5;
      }
      .btn-export.png {
        background-color: #8b5cf6;
      }
      .btn-export.png:hover {
        background-color: #7c3aed;
      }
      .btn-export.csv {
        background-color: #f59e0b;
      }
      .btn-export.csv:hover {
        background-color: #d97706;
      }
      .btn-export.pdf {
        background-color: #ef4444;
      }
      .btn-export.pdf:hover {
        background-color: #dc2626;
      }
      .btn-export.excel {
        background-color: #22c55e;
      }
      .btn-export.excel:hover {
        background-color: #16a34a;
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
      .export-section {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 2px solid #e2e8f0;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
      }
      .export-title {
        font-size: 14px;
        font-weight: 600;
        color: #475569;
        margin-right: 10px;
        display: flex;
        align-items: center;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Contenedor principal
    var container = document.createElement('div');
    container.className = 'component-container';
    
    // Header con título y botones
    var headerContainer = document.createElement('div');
    headerContainer.className = 'header-container';

    var title = document.createElement('h2');
    var titleText = document.createTextNode('Climatología Completa - ' + this._data.ciudad);
    title.appendChild(titleText);
    headerContainer.appendChild(title);

    var btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';

    // Botón toggle de temperatura
    var toggleButton = document.createElement('button');
    toggleButton.className = 'btn-toggle';
    var toggleText = document.createTextNode('Cambiar a °' + (this._unit === 'C' ? 'F' : 'C'));
    toggleButton.appendChild(toggleText);
    toggleButton.addEventListener('click', this.handleUnitToggle);
    btnContainer.appendChild(toggleButton);

    headerContainer.appendChild(btnContainer);
    container.appendChild(headerContainer);

    // Tabla de datos (sin cambios)
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
      var thText = document.createTextNode(text);
      th.appendChild(thText);
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    this._data.registros.forEach(function(reg) {
      var row = document.createElement('tr');

      var cellMes = document.createElement('td');
      var mesText = document.createTextNode(reg.mes);
      cellMes.appendChild(mesText);

      var cellMax = document.createElement('td');
      cellMax.className = 'max';
      var maxText = document.createTextNode(this.formatTemp(reg.max));
      cellMax.appendChild(maxText);

      var cellMin = document.createElement('td');
      cellMin.className = 'min';
      var minText = document.createTextNode(this.formatTemp(reg.min));
      cellMin.appendChild(minText);

      var cellMed = document.createElement('td');
      cellMed.className = 'med';
      var medText = document.createTextNode(this.formatTemp(reg.media));
      cellMed.appendChild(medText);

      var cellLluvia = document.createElement('td');
      cellLluvia.className = 'lluvia';
      var lluviaText = document.createTextNode(reg.lluvia.toString());
      cellLluvia.appendChild(lluviaText);

      var cellDias = document.createElement('td');
      var diasText = document.createTextNode(reg.diasLluvia.toString());
      cellDias.appendChild(diasText);

      var cellSol = document.createElement('td');
      cellSol.className = 'sol';
      var solText = document.createTextNode(reg.sol.toString());
      cellSol.appendChild(solText);

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
    container.appendChild(wrapper);

    // === SECCIÓN DE EXPORTACIÓN ===
    var exportSection = document.createElement('div');
    exportSection.className = 'export-section';

    // Título de la sección
    var exportTitle = document.createElement('span');
    exportTitle.className = 'export-title';
    var titleExportText = document.createTextNode('Exportar:');
    exportTitle.appendChild(titleExportText);
    exportSection.appendChild(exportTitle);

    // Botón Imprimir
    var printBtn = document.createElement('button');
    printBtn.className = 'btn-export print';
    var printText = document.createTextNode('🖨️ Imprimir');
    printBtn.appendChild(printText);
    printBtn.addEventListener('click', this.handlePrint);
    exportSection.appendChild(printBtn);

    // Botón PNG
    var pngBtn = document.createElement('button');
    pngBtn.className = 'btn-export png';
    var pngText = document.createTextNode('🖼️ PNG');
    pngBtn.appendChild(pngText);
    pngBtn.addEventListener('click', this.handleExportPNG);
    exportSection.appendChild(pngBtn);

    // Botón CSV
    var csvBtn = document.createElement('button');
    csvBtn.className = 'btn-export csv';
    var csvText = document.createTextNode('📊 CSV');
    csvBtn.appendChild(csvText);
    csvBtn.addEventListener('click', this.handleExportCSV);
    exportSection.appendChild(csvBtn);

    // Botón PDF
    var pdfBtn = document.createElement('button');
    pdfBtn.className = 'btn-export pdf';
    var pdfText = document.createTextNode('📄 PDF');
    pdfBtn.appendChild(pdfText);
    pdfBtn.addEventListener('click', this.handleExportPDF);
    exportSection.appendChild(pdfBtn);

    // Botón Excel
    var excelBtn = document.createElement('button');
    excelBtn.className = 'btn-export excel';
    var excelText = document.createTextNode('📈 Excel');
    excelBtn.appendChild(excelText);
    excelBtn.addEventListener('click', this.handleExportExcel);
    exportSection.appendChild(excelBtn);

    container.appendChild(exportSection);
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('weather-data-extended', WeatherDataExtended);