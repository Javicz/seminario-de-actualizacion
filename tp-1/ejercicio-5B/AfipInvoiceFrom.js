class AfipInvoiceForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this._invoiceData = {
      puntoVenta: '0002',
      comprobanteNro: '00000641',
      fechaEmision: '27/07/2016',
      cuit: '',
      ingresosBrutos: '',
      fechaInicio: '01/01/1980',
      periodoDesde: '01/07/2016',
      periodoHasta: '31/07/2016',
      fechaVtoPago: '27/09/2016',
      cuitCliente: '30522763922',
      razonSocial: 'INSTITUTO NACIONAL DE SERVICIOS SOCIALES PARA JUBILADOS Y PE',
      condicionIVA: 'IVA Sujeto Exento',
      condicionVenta: 'Cuenta Corriente',
      items: [
        { 
          codigo: 'UGL 6- CAPITA SALUD MENTAL PERIODO 06/16', 
          cantidad: '1,00', 
          unidad: 'otras unidades', 
          precio: '264002,11', 
          bonif: '0,00', 
          impBonif: '0,00', 
          subtotal: '264002,11' 
        },
        { 
          codigo: 'AJUSTE COMPLEMENTARIO -02/16', 
          cantidad: '1,00', 
          unidad: 'otras unidades', 
          precio: '8016,22', 
          bonif: '0,00', 
          impBonif: '0,00', 
          subtotal: '8016,22' 
        },
        { 
          codigo: 'AJUSTE COMPLEMENTARIO -03/16', 
          cantidad: '1,00', 
          unidad: 'otras unidades', 
          precio: '7575,66', 
          bonif: '0,00', 
          impBonif: '0,00', 
          subtotal: '7575,66' 
        },
        { 
          codigo: 'AJUSTE COMPLEMENTARIO -04/16', 
          cantidad: '1,00', 
          unidad: 'otras unidades', 
          precio: '28457,23', 
          bonif: '0,00', 
          impBonif: '0,00', 
          subtotal: '28457,23' 
        },
        { 
          codigo: 'AJUSTE COMPLEMENTARIO -05/16', 
          cantidad: '1,00', 
          unidad: 'otras unidades', 
          precio: '28531,94', 
          bonif: '0,00', 
          impBonif: '0,00', 
          subtotal: '28531,94' 
        }
      ],
      subtotal: '336583,16',
      otrosTributos: '0,00',
      total: '336583,16',
      caeNro: '66304278833647',
      fechaVtoCAE: '06/08/2016',
      pagina: '1/1'
    };
    
    this._currentItems = [];
    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.generateInvoice = this.generateInvoice.bind(this);
    this.handleExportDirectPDF = this.handleExportDirectPDF.bind(this);
    this.loadHtml2PdfLibrary = this.loadHtml2PdfLibrary.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.setFormData = this.setFormData.bind(this);
  }

  connectedCallback() {
    this.render();
    this._currentItems = JSON.parse(JSON.stringify(this._invoiceData.items));
    this.renderItems();
  }

  getFormData() {
    var form = this.shadowRoot.querySelector('#invoice-form');
    var formData = {};
    
    var inputs = form.querySelectorAll('input, select, textarea');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if (input.name) {
        formData[input.name] = input.value;
      }
    }
    
    formData.items = this._currentItems;
    return formData;
  }

  setFormData(data) {
    this._invoiceData = JSON.parse(JSON.stringify(data));
    this._currentItems = JSON.parse(JSON.stringify(data.items || []));
    this.render();
    this.renderItems();
  }

  handleAddItem() {
    var newItem = {
      codigo: '',
      cantidad: '1,00',
      unidad: 'otras unidades',
      precio: '0,00',
      bonif: '0,00',
      impBonif: '0,00',
      subtotal: '0,00'
    };
    this._currentItems.push(newItem);
    this.renderItems();
  }

  handleRemoveItem(index) {
    if (this._currentItems.length > 1) {
      this._currentItems.splice(index, 1);
      this.renderItems();
    } else {
      alert('Debe haber al menos un item en la factura');
    }
  }

  updateItem(index, field, value) {
    if (this._currentItems[index]) {
      this._currentItems[index][field] = value;
      if (field === 'precio' || field === 'cantidad' || field === 'bonif') {
        this.recalculateItem(index);
      }
    }
  }

  recalculateItem(index) {
    var item = this._currentItems[index];
    var precio = parseFloat(item.precio.replace(',', '.')) || 0;
    var cantidad = parseFloat(item.cantidad.replace(',', '.')) || 0;
    var bonif = parseFloat(item.bonif.replace(',', '.')) || 0;
    
    var subtotal = precio * cantidad;
    var impBonif = (subtotal * bonif) / 100;
    var totalItem = subtotal - impBonif;
    
    item.subtotal = totalItem.toFixed(2).replace('.', ',');
    item.impBonif = impBonif.toFixed(2).replace('.', ',');
    
    this.renderItems();
    this.updateTotals();
  }

  updateTotals() {
    var total = 0;
    for (var i = 0; i < this._currentItems.length; i++) {
      var subtotal = parseFloat(this._currentItems[i].subtotal.replace(',', '.')) || 0;
      total += subtotal;
    }
    
    var subtotalInput = this.shadowRoot.querySelector('#subtotal');
    var totalInput = this.shadowRoot.querySelector('#total');
    
    if (subtotalInput) {
      subtotalInput.value = total.toFixed(2).replace('.', ',');
    }
    if (totalInput) {
      totalInput.value = total.toFixed(2).replace('.', ',');
    }
  }

  renderItems() {
    var itemsContainer = this.shadowRoot.querySelector('#items-container');
    if (!itemsContainer) return;
    
    while (itemsContainer.firstChild) {
      itemsContainer.removeChild(itemsContainer.firstChild);
    }
    
    for (var i = 0; i < this._currentItems.length; i++) {
      var itemRow = this.createItemRow(i, this._currentItems[i]);
      itemsContainer.appendChild(itemRow);
    }
  }

  createItemRow(index, item) {
    var row = document.createElement('div');
    row.className = 'item-row';
    
    var codigoDiv = document.createElement('div');
    codigoDiv.className = 'item-field';
    var codigoLabel = document.createElement('label');
    var codigoText = document.createTextNode('Código');
    codigoLabel.appendChild(codigoText);
    codigoDiv.appendChild(codigoLabel);
    
    var codigoInput = document.createElement('input');
    codigoInput.type = 'text';
    codigoInput.name = 'item_codigo_' + index;
    codigoInput.value = item.codigo || '';
    codigoInput.addEventListener('input', function(event) {
      this.updateItem(index, 'codigo', event.target.value);
    }.bind(this));
    codigoDiv.appendChild(codigoInput);
    row.appendChild(codigoDiv);
    
    var cantDiv = document.createElement('div');
    cantDiv.className = 'item-field small';
    var cantLabel = document.createElement('label');
    var cantText = document.createTextNode('Cant.');
    cantLabel.appendChild(cantText);
    cantDiv.appendChild(cantLabel);
    
    var cantInput = document.createElement('input');
    cantInput.type = 'text';
    cantInput.name = 'item_cantidad_' + index;
    cantInput.value = item.cantidad || '1,00';
    cantInput.addEventListener('input', function(event) {
      this.updateItem(index, 'cantidad', event.target.value);
    }.bind(this));
    cantDiv.appendChild(cantInput);
    row.appendChild(cantDiv);
    
    var unidadDiv = document.createElement('div');
    unidadDiv.className = 'item-field';
    var unidadLabel = document.createElement('label');
    var unidadText = document.createTextNode('U. Medida');
    unidadLabel.appendChild(unidadText);
    unidadDiv.appendChild(unidadLabel);
    
    var unidadInput = document.createElement('input');
    unidadInput.type = 'text';
    unidadInput.name = 'item_unidad_' + index;
    unidadInput.value = item.unidad || 'otras unidades';
    unidadInput.addEventListener('input', function(event) {
      this.updateItem(index, 'unidad', event.target.value);
    }.bind(this));
    unidadDiv.appendChild(unidadInput);
    row.appendChild(unidadDiv);
    
    var precioDiv = document.createElement('div');
    precioDiv.className = 'item-field small';
    var precioLabel = document.createElement('label');
    var precioText = document.createTextNode('Precio');
    precioLabel.appendChild(precioText);
    precioDiv.appendChild(precioLabel);
    
    var precioInput = document.createElement('input');
    precioInput.type = 'text';
    precioInput.name = 'item_precio_' + index;
    precioInput.value = item.precio || '0,00';
    precioInput.addEventListener('input', function(event) {
      this.updateItem(index, 'precio', event.target.value);
    }.bind(this));
    precioDiv.appendChild(precioInput);
    row.appendChild(precioDiv);
    
    var bonifDiv = document.createElement('div');
    bonifDiv.className = 'item-field small';
    var bonifLabel = document.createElement('label');
    var bonifText = document.createTextNode('% Bonif.');
    bonifLabel.appendChild(bonifText);
    bonifDiv.appendChild(bonifLabel);
    
    var bonifInput = document.createElement('input');
    bonifInput.type = 'text';
    bonifInput.name = 'item_bonif_' + index;
    bonifInput.value = item.bonif || '0,00';
    bonifInput.addEventListener('input', function(event) {
      this.updateItem(index, 'bonif', event.target.value);
    }.bind(this));
    bonifDiv.appendChild(bonifInput);
    row.appendChild(bonifDiv);
    
    var subtotalDiv = document.createElement('div');
    subtotalDiv.className = 'item-field small';
    var subtotalLabel = document.createElement('label');
    var subtotalText = document.createTextNode('Subtotal');
    subtotalLabel.appendChild(subtotalText);
    subtotalDiv.appendChild(subtotalLabel);
    
    var subtotalInput = document.createElement('input');
    subtotalInput.type = 'text';
    subtotalInput.name = 'item_subtotal_' + index;
    subtotalInput.value = item.subtotal || '0,00';
    subtotalInput.readOnly = true;
    subtotalDiv.appendChild(subtotalInput);
    row.appendChild(subtotalDiv);
    
    var removeDiv = document.createElement('div');
    removeDiv.className = 'item-field remove-btn';
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    var removeText = document.createTextNode('✕');
    removeBtn.appendChild(removeText);
    removeBtn.className = 'btn-remove';
    removeBtn.addEventListener('click', function() {
      this.handleRemoveItem(index);
    }.bind(this));
    removeDiv.appendChild(removeBtn);
    row.appendChild(removeDiv);
    
    return row;
  }

  loadHtml2PdfLibrary(callback) {
    if (typeof html2pdf !== 'undefined') {
      callback();
      return;
    }
    
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = callback;
    script.onerror = function() {
      console.error('Error al cargar html2pdf.js');
      alert('No se pudo cargar la librería para exportar PDF. Verifique su conexión a internet.');
    };
    document.head.appendChild(script);
  }

  // === MÉTODO CORREGIDO PARA EXPORTAR PDF ===
  handleExportDirectPDF() {
    var btn = this.shadowRoot.querySelector('#pdf-direct-btn');
    var originalText = '📄 PDF Directo';
    if (btn) {
      btn.textContent = '⏳ Generando...';
      btn.disabled = true;
    }
    
    this.loadHtml2PdfLibrary(function() {
      try {
        var formData = this.getFormData();
        
        // Actualizar totales
        var total = 0;
        for (var i = 0; i < formData.items.length; i++) {
          var subtotal = parseFloat(formData.items[i].subtotal.replace(',', '.')) || 0;
          total += subtotal;
        }
        formData.subtotal = total.toFixed(2).replace('.', ',');
        formData.total = total.toFixed(2).replace('.', ',');
        
        // Crear contenedor temporal
        var tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '0';
        tempContainer.style.top = '0';
        tempContainer.style.width = '100%';
        tempContainer.style.height = '100%';
        tempContainer.style.background = 'white';
        tempContainer.style.zIndex = '9999';
        tempContainer.style.overflow = 'auto';
        tempContainer.style.padding = '40px';
        tempContainer.style.display = 'flex';
        tempContainer.style.justifyContent = 'center';
        tempContainer.style.alignItems = 'center';
        
        var invoiceHTML = this.buildInvoiceHTML(formData);
        tempContainer.innerHTML = invoiceHTML;
        document.body.appendChild(tempContainer);
        
        // Buscar el elemento de la factura
        var invoiceElement = tempContainer.querySelector('.invoice');
        if (!invoiceElement) {
          console.error('No se encontró el elemento de la factura.');
          document.body.removeChild(tempContainer);
          if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
          }
          return;
        }
        
        // Esperar a que los estilos se apliquen
        var self = this;
        var btnRef = btn;
        var origText = originalText;
        
        // Usar requestAnimationFrame para asegurar que el DOM esté renderizado
        requestAnimationFrame(function() {
          setTimeout(function() {
            // Configurar opciones mejoradas
            var opt = {
              margin: [10, 10, 10, 10],
              filename: 'Factura_AFIP_' + (formData.comprobanteNro || '00000000') + '.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: true,
                width: invoiceElement.scrollWidth,
                height: invoiceElement.scrollHeight,
                windowWidth: invoiceElement.scrollWidth,
                windowHeight: invoiceElement.scrollHeight
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
              },
              pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            // Usar html2pdf con promesa
            html2pdf()
              .set(opt)
              .from(invoiceElement)
              .save()
              .then(function() {
                // Limpiar contenedor temporal
                if (tempContainer.parentNode) {
                  document.body.removeChild(tempContainer);
                }
                if (btnRef) {
                  btnRef.textContent = origText;
                  btnRef.disabled = false;
                }
                console.log('PDF generado con éxito.');
              })
              .catch(function(error) {
                console.error('Error al generar PDF:', error);
                alert('Ocurrió un error al generar el PDF. Por favor, intente de nuevo.');
                if (tempContainer.parentNode) {
                  document.body.removeChild(tempContainer);
                }
                if (btnRef) {
                  btnRef.textContent = origText;
                  btnRef.disabled = false;
                }
              });
          }, 500);
        });
        
      } catch (error) {
        console.error('Error en la exportación:', error);
        alert('Error al preparar la factura para PDF.');
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }
    }.bind(this));
  }

  generateInvoice() {
    var formData = this.getFormData();
    
    var total = 0;
    for (var i = 0; i < formData.items.length; i++) {
      var subtotal = parseFloat(formData.items[i].subtotal.replace(',', '.')) || 0;
      total += subtotal;
    }
    formData.subtotal = total.toFixed(2).replace('.', ',');
    formData.total = total.toFixed(2).replace('.', ',');
    
    var win = window.open('', '_blank', 'width=1100,height=800');
    if (!win) {
      alert('Por favor, permita las ventanas emergentes para ver la factura');
      return;
    }
    
    var invoiceHTML = this.buildInvoiceHTML(formData);
    win.document.write(invoiceHTML);
    win.document.close();
    win.focus();
  }

  buildInvoiceHTML(data) {
    var itemsRows = '';
    var totalFactura = 0;
    
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      var subtotal = parseFloat(item.subtotal.replace(',', '.')) || 0;
      totalFactura += subtotal;
      
      itemsRows += '<tr>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;">' + (item.codigo || '') + '</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">' + (item.cantidad || '1,00') + '</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">' + (item.unidad || 'otras unidades') + '</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$ ' + (item.precio || '0,00') + '</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">' + (item.bonif || '0,00') + '%</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$ ' + (item.impBonif || '0,00') + '</td>';
      itemsRows += '<td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$ ' + (item.subtotal || '0,00') + '</td>';
      itemsRows += '</tr>';
    }
    
    var totalFormateado = totalFactura.toFixed(2).replace('.', ',');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura AFIP - ${data.comprobanteNro || '00000000'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            background: #f5f5f5;
            padding: 40px;
            display: flex;
            justify-content: center;
            min-height: 100vh;
          }
          .invoice {
            max-width: 1100px;
            width: 100%;
            background: white;
            padding: 30px;
            border: 2px solid #333;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header-left h1 {
            font-size: 28px;
            letter-spacing: 3px;
            color: #1a1a1a;
            margin: 0;
          }
          .header-left p {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .header-right {
            text-align: right;
            font-size: 14px;
            line-height: 1.8;
          }
          .header-right strong {
            color: #1a1a1a;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            font-size: 14px;
          }
          .info-grid .label {
            font-weight: bold;
            color: #555;
          }
          .info-grid .value {
            color: #1a1a1a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
          }
          th {
            background: #1a1a1a;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: normal;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background: #f9f9f9;
          }
          .totals {
            margin-top: 20px;
            border-top: 2px solid #333;
            padding-top: 15px;
            text-align: right;
            font-size: 16px;
          }
          .totals div {
            margin: 5px 0;
          }
          .totals .total {
            font-size: 20px;
            font-weight: bold;
            color: #1a1a1a;
          }
          .cae-section {
            margin-top: 20px;
            padding: 15px;
            background: #f0f0f0;
            border: 1px solid #ccc;
            text-align: center;
          }
          .cae-section .cae-number {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #1a1a1a;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          .comprobante-autorizado {
            display: inline-block;
            border: 2px solid #1a1a1a;
            padding: 5px 20px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          @media print {
            body { background: white; padding: 20px; }
            .invoice { box-shadow: none; border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="header-left">
              <h1>FACTURA</h1>
              <p>Comprobante Autorizado</p>
            </div>
            <div class="header-right">
              <div><strong>Punto de Venta:</strong> ${data.puntoVenta || '0000'}</div>
              <div><strong>Comp. Nro:</strong> ${data.comprobanteNro || '00000000'}</div>
              <div><strong>Fecha de Emisión:</strong> ${data.fechaEmision || ''}</div>
              <div><strong>CUIT:</strong> ${data.cuit || ''}</div>
              <div><strong>Ingresos Brutos:</strong> ${data.ingresosBrutos || ''}</div>
              <div><strong>Inicio Actividades:</strong> ${data.fechaInicio || ''}</div>
            </div>
          </div>
          
          <div class="info-grid">
            <div>
              <span class="label">Periodo Facturado Desde:</span>
              <span class="value">${data.periodoDesde || ''}</span>
            </div>
            <div>
              <span class="label">Hasta:</span>
              <span class="value">${data.periodoHasta || ''}</span>
            </div>
            <div>
              <span class="label">Fecha de Vto. para el pago:</span>
              <span class="value">${data.fechaVtoPago || ''}</span>
            </div>
          </div>
          
          <div class="info-grid" style="margin-top: 0;">
            <div style="grid-column: 1 / -1;">
              <span class="label">CUIT:</span>
              <span class="value">${data.cuitCliente || ''}</span>
            </div>
            <div style="grid-column: 1 / -1;">
              <span class="label">Apellido y Nombre / Razón Social:</span>
              <span class="value">${data.razonSocial || ''}</span>
            </div>
            <div>
              <span class="label">Condición frente al IVA:</span>
              <span class="value">${data.condicionIVA || ''}</span>
            </div>
            <div>
              <span class="label">Condición de venta:</span>
              <span class="value">${data.condicionVenta || ''}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="padding:10px 8px;text-align:left;">Código</th>
                <th style="padding:10px 8px;text-align:center;">Cant.</th>
                <th style="padding:10px 8px;text-align:center;">U. Medida</th>
                <th style="padding:10px 8px;text-align:right;">Precio Unit.</th>
                <th style="padding:10px 8px;text-align:center;">% Bonif.</th>
                <th style="padding:10px 8px;text-align:right;">Imp. Bonif.</th>
                <th style="padding:10px 8px;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="totals">
            <div><strong>Subtotal:</strong> $ ${data.subtotal || totalFormateado}</div>
            <div><strong>Importe Otros Tributos:</strong> $ ${data.otrosTributos || '0,00'}</div>
            <div class="total"><strong>Importe Total:</strong> $ ${data.total || totalFormateado}</div>
          </div>
          
          <div class="cae-section">
            <div><strong>CAE Nº:</strong> <span class="cae-number">${data.caeNro || ''}</span></div>
            <div style="margin-top:5px;"><strong>Fecha de Vto. de CAE:</strong> ${data.fechaVtoCAE || ''}</div>
          </div>
          
          <div class="footer">
            <div class="comprobante-autorizado">COMPROBANTE AUTORIZADO</div>
            <div style="margin-top:5px;">Pág. ${data.pagina || '1/1'}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.generateInvoice();
  }

  render() {
    this.shadowRoot.textContent = '';
    
    var style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        max-width: 1000px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }
      
      .form-header {
        background: linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%);
        color: white;
        padding: 20px 30px;
        border-bottom: 3px solid #1a3a5c;
      }
      
      .form-header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }
      
      .form-header p {
        margin: 5px 0 0 0;
        opacity: 0.85;
        font-size: 14px;
      }
      
      .form-body {
        padding: 25px 30px;
      }
      
      .form-section {
        margin-bottom: 25px;
        padding: 15px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      
      .form-section h3 {
        margin: 0 0 15px 0;
        color: #1a3a5c;
        font-size: 16px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 8px;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }
      
      .form-field {
        display: flex;
        flex-direction: column;
      }
      
      .form-field label {
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        margin-bottom: 4px;
      }
      
      .form-field input, 
      .form-field select,
      .form-field textarea {
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
      }
      
      .form-field input:focus,
      .form-field select:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: #2d6a9f;
        box-shadow: 0 0 0 3px rgba(45, 106, 159, 0.1);
      }
      
      .form-field input[readonly] {
        background: #f1f5f9;
        color: #475569;
      }
      
      .form-field.full-width {
        grid-column: 1 / -1;
      }
      
      .items-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .items-header h4 {
        margin: 0;
        color: #1a3a5c;
        font-size: 14px;
      }
      
      .btn-add-item {
        padding: 6px 16px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .btn-add-item:hover {
        background: #059669;
      }
      
      #items-container {
        margin-bottom: 15px;
      }
      
      .item-row {
        display: grid;
        grid-template-columns: 2fr 0.7fr 1.2fr 0.8fr 0.7fr 0.8fr 0.8fr 0.3fr;
        gap: 8px;
        align-items: end;
        padding: 10px;
        background: white;
        border-radius: 6px;
        margin-bottom: 8px;
        border: 1px solid #e2e8f0;
      }
      
      .item-field {
        display: flex;
        flex-direction: column;
      }
      
      .item-field label {
        font-size: 10px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 2px;
      }
      
      .item-field input {
        padding: 6px 8px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 12px;
        width: 100%;
      }
      
      .item-field input:focus {
        outline: none;
        border-color: #2d6a9f;
      }
      
      .item-field.small input {
        font-size: 12px;
        padding: 6px 4px;
      }
      
      .item-field.remove-btn {
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      
      .btn-remove {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        line-height: 1.5;
      }
      
      .btn-remove:hover {
        background: #dc2626;
      }
      
      .form-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #e2e8f0;
        justify-content: flex-end;
      }
      
      .btn-generate {
        padding: 12px 30px;
        background: linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .btn-generate:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(26, 58, 92, 0.3);
      }
      
      .btn-generate:active {
        transform: translateY(0);
      }
      
      .btn-pdf-direct {
        padding: 12px 30px;
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .btn-pdf-direct:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
      }
      
      .btn-pdf-direct:active {
        transform: translateY(0);
      }
      
      .btn-pdf-direct:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }
      
      @media (max-width: 768px) {
        .item-row {
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .item-field.remove-btn {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .form-body {
          padding: 15px;
        }
        .form-section {
          padding: 10px;
        }
        .form-actions {
          flex-direction: column;
        }
        .form-actions button {
          width: 100%;
        }
      }
    `;
    this.shadowRoot.appendChild(style);
    
    var form = document.createElement('form');
    form.id = 'invoice-form';
    form.addEventListener('submit', this.handleSubmit);
    
    var header = document.createElement('div');
    header.className = 'form-header';
    
    var title = document.createElement('h2');
    var titleText = document.createTextNode('📄 Generador de Factura AFIP');
    title.appendChild(titleText);
    header.appendChild(title);
    
    var subtitle = document.createElement('p');
    var subtitleText = document.createTextNode('Complete los datos de la factura y haga clic en "Generar Factura"');
    subtitle.appendChild(subtitleText);
    header.appendChild(subtitle);
    
    form.appendChild(header);
    
    var body = document.createElement('div');
    body.className = 'form-body';
    
    // SECCIÓN ENCABEZADO
    var section1 = document.createElement('div');
    section1.className = 'form-section';
    
    var sectionTitle1 = document.createElement('h3');
    var st1Text = document.createTextNode('📋 Encabezado');
    sectionTitle1.appendChild(st1Text);
    section1.appendChild(sectionTitle1);
    
    var grid1 = document.createElement('div');
    grid1.className = 'form-grid';
    
    var fields1 = [
      { name: 'puntoVenta', label: 'Punto de Venta', value: this._invoiceData.puntoVenta },
      { name: 'comprobanteNro', label: 'Comp. Nro', value: this._invoiceData.comprobanteNro },
      { name: 'fechaEmision', label: 'Fecha Emisión', value: this._invoiceData.fechaEmision },
      { name: 'cuit', label: 'CUIT', value: this._invoiceData.cuit },
      { name: 'ingresosBrutos', label: 'Ingresos Brutos', value: this._invoiceData.ingresosBrutos },
      { name: 'fechaInicio', label: 'Inicio Actividades', value: this._invoiceData.fechaInicio }
    ];
    
    for (var i = 0; i < fields1.length; i++) {
      var field = this.createField(fields1[i].name, fields1[i].label, fields1[i].value);
      grid1.appendChild(field);
    }
    
    section1.appendChild(grid1);
    body.appendChild(section1);
    
    // SECCIÓN PERIODO
    var section2 = document.createElement('div');
    section2.className = 'form-section';
    
    var sectionTitle2 = document.createElement('h3');
    var st2Text = document.createTextNode('📅 Periodo');
    sectionTitle2.appendChild(st2Text);
    section2.appendChild(sectionTitle2);
    
    var grid2 = document.createElement('div');
    grid2.className = 'form-grid';
    
    var fields2 = [
      { name: 'periodoDesde', label: 'Desde', value: this._invoiceData.periodoDesde },
      { name: 'periodoHasta', label: 'Hasta', value: this._invoiceData.periodoHasta },
      { name: 'fechaVtoPago', label: 'Fecha Vto. Pago', value: this._invoiceData.fechaVtoPago }
    ];
    
    for (var j = 0; j < fields2.length; j++) {
      var field2 = this.createField(fields2[j].name, fields2[j].label, fields2[j].value);
      grid2.appendChild(field2);
    }
    
    section2.appendChild(grid2);
    body.appendChild(section2);
    
    // SECCIÓN CLIENTE
    var section3 = document.createElement('div');
    section3.className = 'form-section';
    
    var sectionTitle3 = document.createElement('h3');
    var st3Text = document.createTextNode('👤 Cliente');
    sectionTitle3.appendChild(st3Text);
    section3.appendChild(sectionTitle3);
    
    var grid3 = document.createElement('div');
    grid3.className = 'form-grid';
    
    var fields3 = [
      { name: 'cuitCliente', label: 'CUIT Cliente', value: this._invoiceData.cuitCliente },
      { name: 'razonSocial', label: 'Razón Social', value: this._invoiceData.razonSocial, full: true },
      { name: 'condicionIVA', label: 'Condición IVA', value: this._invoiceData.condicionIVA },
      { name: 'condicionVenta', label: 'Condición Venta', value: this._invoiceData.condicionVenta }
    ];
    
    for (var k = 0; k < fields3.length; k++) {
      var field3 = this.createField(fields3[k].name, fields3[k].label, fields3[k].value, fields3[k].full);
      grid3.appendChild(field3);
    }
    
    section3.appendChild(grid3);
    body.appendChild(section3);
    
    // SECCIÓN ITEMS
    var section4 = document.createElement('div');
    section4.className = 'form-section';
    
    var sectionTitle4 = document.createElement('h3');
    var st4Text = document.createTextNode('📦 Productos/Servicios');
    sectionTitle4.appendChild(st4Text);
    section4.appendChild(sectionTitle4);
    
    var itemsHeader = document.createElement('div');
    itemsHeader.className = 'items-header';
    
    var itemsLabel = document.createElement('h4');
    var ilText = document.createTextNode('Items de la factura');
    itemsLabel.appendChild(ilText);
    itemsHeader.appendChild(itemsLabel);
    
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    var addText = document.createTextNode('➕ Agregar Item');
    addBtn.appendChild(addText);
    addBtn.addEventListener('click', this.handleAddItem);
    itemsHeader.appendChild(addBtn);
    
    section4.appendChild(itemsHeader);
    
    var itemsContainer = document.createElement('div');
    itemsContainer.id = 'items-container';
    section4.appendChild(itemsContainer);
    
    body.appendChild(section4);
    
    // SECCIÓN TOTALES
    var section5 = document.createElement('div');
    section5.className = 'form-section';
    
    var sectionTitle5 = document.createElement('h3');
    var st5Text = document.createTextNode('💰 Totales');
    sectionTitle5.appendChild(st5Text);
    section5.appendChild(sectionTitle5);
    
    var grid5 = document.createElement('div');
    grid5.className = 'form-grid';
    
    var fields5 = [
      { name: 'subtotal', label: 'Subtotal', value: this._invoiceData.subtotal },
      { name: 'otrosTributos', label: 'Otros Tributos', value: this._invoiceData.otrosTributos },
      { name: 'total', label: 'Total', value: this._invoiceData.total }
    ];
    
    for (var l = 0; l < fields5.length; l++) {
      var field5 = this.createField(fields5[l].name, fields5[l].label, fields5[l].value);
      grid5.appendChild(field5);
    }
    
    section5.appendChild(grid5);
    body.appendChild(section5);
    
    // SECCIÓN CAE
    var section6 = document.createElement('div');
    section6.className = 'form-section';
    
    var sectionTitle6 = document.createElement('h3');
    var st6Text = document.createTextNode('🔐 CAE');
    sectionTitle6.appendChild(st6Text);
    section6.appendChild(sectionTitle6);
    
    var grid6 = document.createElement('div');
    grid6.className = 'form-grid';
    
    var fields6 = [
      { name: 'caeNro', label: 'CAE Nº', value: this._invoiceData.caeNro },
      { name: 'fechaVtoCAE', label: 'Fecha Vto. CAE', value: this._invoiceData.fechaVtoCAE },
      { name: 'pagina', label: 'Página', value: this._invoiceData.pagina }
    ];
    
    for (var m = 0; m < fields6.length; m++) {
      var field6 = this.createField(fields6[m].name, fields6[m].label, fields6[m].value);
      grid6.appendChild(field6);
    }
    
    section6.appendChild(grid6);
    body.appendChild(section6);
    
    // BOTONES DE ACCIÓN
    var actions = document.createElement('div');
    actions.className = 'form-actions';
    
    var generateBtn = document.createElement('button');
    generateBtn.type = 'submit';
    generateBtn.className = 'btn-generate';
    var genText = document.createTextNode('📄 Abrir Factura');
    generateBtn.appendChild(genText);
    actions.appendChild(generateBtn);
    
    var pdfDirectBtn = document.createElement('button');
    pdfDirectBtn.type = 'button';
    pdfDirectBtn.className = 'btn-pdf-direct';
    pdfDirectBtn.id = 'pdf-direct-btn';
    var pdfText = document.createTextNode('📄 PDF Directo');
    pdfDirectBtn.appendChild(pdfText);
    pdfDirectBtn.addEventListener('click', this.handleExportDirectPDF);
    actions.appendChild(pdfDirectBtn);
    
    body.appendChild(actions);
    
    form.appendChild(body);
    this.shadowRoot.appendChild(form);
  }

  createField(name, label, value, fullWidth) {
    var div = document.createElement('div');
    div.className = 'form-field';
    if (fullWidth) {
      div.className += ' full-width';
    }
    
    var labelEl = document.createElement('label');
    var labelText = document.createTextNode(label);
    labelEl.appendChild(labelText);
    div.appendChild(labelEl);
    
    var input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.value = value || '';
    input.id = name;
    
    if (name === 'subtotal' || name === 'total') {
      input.readOnly = true;
    }
    
    div.appendChild(input);
    return div;
  }
}

customElements.define('afip-invoice-form', AfipInvoiceForm);