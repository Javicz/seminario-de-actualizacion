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
        { codigo: 'UGL 6- CAPITA SALUD PERIODO 06/16', cantidad: '1,00', unidad: 'otras unidades', precio: '264002,11', bonif: '0,00', impBonif: '0,00', subtotal: '264002,11' },
        { codigo: 'AJUSTE COMPLEMENTARIO -02/16', cantidad: '1,00', unidad: 'otras unidades', precio: '8016,22', bonif: '0,00', impBonif: '0,00', subtotal: '8016,22' },
        { codigo: 'AJUSTE COMPLEMENTARIO -03/16', cantidad: '1,00', unidad: 'otras unidades', precio: '7575,66', bonif: '0,00', impBonif: '0,00', subtotal: '7575,66' },
        { codigo: 'AJUSTE COMPLEMENTARIO -04/16', cantidad: '1,00', unidad: 'otras unidades', precio: '28457,23', bonif: '0,00', impBonif: '0,00', subtotal: '28457,23' },
        { codigo: 'AJUSTE COMPLEMENTARIO -05/16', cantidad: '1,00', unidad: 'otras unidades', precio: '28531,94', bonif: '0,00', impBonif: '0,00', subtotal: '28531,94' }
      ],
      subtotal: '336583,16',
      otrosTributos: '0,00',
      total: '336583,16',
      caeNro: '66304278833647',
      fechaVtoCAE: '06/08/2016',
      pagina: '1/1'
    };
    
    this._currentItems = [];
    
    // Bind de métodos
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.generateInvoice = this.generateInvoice.bind(this);
    this.handleExportDirectPDF = this.handleExportDirectPDF.bind(this);
    this.loadJSPDF = this.loadJSPDF.bind(this);
    this.getFormData = this.getFormData.bind(this);
    this.getFullInvoiceHTML = this.getFullInvoiceHTML.bind(this);
    this._handleItemInput = this._handleItemInput.bind(this);
    this._handleItemRemove = this._handleItemRemove.bind(this);
    
    // Renderizar inicial
    this.render();
    this._currentItems = JSON.parse(JSON.stringify(this._invoiceData.items));
    this.renderItems();
  }

  // ===== CONNECTED =====
  connectedCallback() {
    // Asignar eventos principales
    this._form = this.shadowRoot.querySelector('#invoice-form');
    this._addBtn = this.shadowRoot.querySelector('.btn-add-item');
    this._pdfBtn = this.shadowRoot.querySelector('#pdf-direct-btn');
    this._itemsContainer = this.shadowRoot.querySelector('#items-container');

    if (this._form) {
      this._form.addEventListener('submit', this.handleSubmit);
    }
    if (this._addBtn) {
      this._addBtn.addEventListener('click', this.handleAddItem);
    }
    if (this._pdfBtn) {
      this._pdfBtn.addEventListener('click', this.handleExportDirectPDF);
    }
    if (this._itemsContainer) {
      // Delegación de eventos para los items
      this._itemsContainer.addEventListener('input', this._handleItemInput);
      this._itemsContainer.addEventListener('click', this._handleItemRemove);
    }
  }

  // ===== DISCONNECTED =====
  disconnectedCallback() {
    if (this._form) {
      this._form.removeEventListener('submit', this.handleSubmit);
    }
    if (this._addBtn) {
      this._addBtn.removeEventListener('click', this.handleAddItem);
    }
    if (this._pdfBtn) {
      this._pdfBtn.removeEventListener('click', this.handleExportDirectPDF);
    }
    if (this._itemsContainer) {
      this._itemsContainer.removeEventListener('input', this._handleItemInput);
      this._itemsContainer.removeEventListener('click', this._handleItemRemove);
    }
  }

  // ===== DELEGACIÓN DE EVENTOS PARA ITEMS =====
  _handleItemInput(event) {
    var target = event.target;
    if (target.tagName === 'INPUT' && target.dataset.index !== undefined && target.dataset.field) {
      var index = parseInt(target.dataset.index);
      var field = target.dataset.field;
      this.updateItem(index, field, target.value);
    }
  }

  _handleItemRemove(event) {
    var target = event.target;
    if (target.tagName === 'BUTTON' && target.dataset.index !== undefined && target.dataset.action === 'remove') {
      var index = parseInt(target.dataset.index);
      this.handleRemoveItem(index);
    }
  }

  // ===== MÉTODOS DE DATOS =====
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
    row.dataset.index = index;
    
    var fields = [
      { key: 'codigo', label: 'Código', value: item.codigo || '' },
      { key: 'cantidad', label: 'Cant.', value: item.cantidad || '1,00', small: true },
      { key: 'unidad', label: 'U. Medida', value: item.unidad || 'otras unidades' },
      { key: 'precio', label: 'Precio', value: item.precio || '0,00', small: true },
      { key: 'bonif', label: '% Bonif.', value: item.bonif || '0,00', small: true },
      { key: 'subtotal', label: 'Subtotal', value: item.subtotal || '0,00', small: true, readonly: true }
    ];
    
    for (var f = 0; f < fields.length; f++) {
      var field = fields[f];
      var div = document.createElement('div');
      div.className = 'item-field' + (field.small ? ' small' : '');
      var label = document.createElement('label');
      var labelText = document.createTextNode(field.label);
      label.appendChild(labelText);
      div.appendChild(label);
      var input = document.createElement('input');
      input.type = 'text';
      input.name = 'item_' + field.key + '_' + index;
      input.value = field.value;
      input.dataset.index = index;
      input.dataset.field = field.key;
      if (field.readonly) {
        input.readOnly = true;
      }
      div.appendChild(input);
      row.appendChild(div);
    }
    
    var removeDiv = document.createElement('div');
    removeDiv.className = 'item-field remove-btn';
    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    var removeText = document.createTextNode('✕');
    removeBtn.appendChild(removeText);
    removeBtn.className = 'btn-remove';
    removeBtn.dataset.index = index;
    removeBtn.dataset.action = 'remove';
    removeDiv.appendChild(removeBtn);
    row.appendChild(removeDiv);
    
    return row;
  }

  // ===== CARGAR jsPDF =====
  loadJSPDF(callback) {
    if (typeof window.jspdf !== 'undefined') {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = callback;
    script.onerror = function() {
      alert('Error al cargar jsPDF. Verifique su conexión.');
    };
    document.head.appendChild(script);
  }

  // ===== GENERAR FACTURA EN PESTAÑA =====
  generateInvoice() {
    var formData = this.getFormData();
    var total = 0;
    for (var i = 0; i < formData.items.length; i++) {
      total += parseFloat(formData.items[i].subtotal.replace(',', '.')) || 0;
    }
    formData.subtotal = total.toFixed(2).replace('.', ',');
    formData.total = total.toFixed(2).replace('.', ',');
    
    var fullHTML = this.getFullInvoiceHTML(formData);
    var blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var win = window.open(url, '_blank', 'width=1100,height=800');
    if (!win) {
      URL.revokeObjectURL(url);
      alert('Permita ventanas emergentes');
    }
  }

  // ===== HTML DE LA FACTURA =====
  getFullInvoiceHTML(data) {
    var itemsRows = '';
    var totalFactura = 0;
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      totalFactura += parseFloat(item.subtotal.replace(',', '.')) || 0;
      itemsRows += '<tr><td>' + (item.codigo || '') + '</td><td style="text-align:center;">' + (item.cantidad || '1,00') + '</td><td style="text-align:center;">' + (item.unidad || 'otras') + '</td><td style="text-align:right;">$ ' + (item.precio || '0,00') + '</td><td style="text-align:center;">' + (item.bonif || '0,00') + '%</td><td style="text-align:right;">$ ' + (item.impBonif || '0,00') + '</td><td style="text-align:right;">$ ' + (item.subtotal || '0,00') + '</td></tr>';
    }
    var totalFormateado = totalFactura.toFixed(2).replace('.', ',');
    
    return `<!DOCTYPE html>
    <html><head><meta charset="UTF-8"><title>Factura AFIP</title>
    <style>
      body { font-family: 'Courier New', monospace; background: #f5f5f5; padding: 40px; display: flex; justify-content: center; }
      .invoice { max-width: 1100px; width: 100%; background: white; padding: 30px; border: 2px solid #333; }
      .header { display: flex; justify-content: space-between; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
      .header-left h1 { font-size: 28px; margin: 0; }
      .header-left p { font-size: 12px; color: #666; }
      .header-right { text-align: right; font-size: 14px; line-height: 1.8; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; }
      .info-grid .label { font-weight: bold; color: #555; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
      th { background: #1a1a1a; color: white; padding: 10px 8px; text-align: left; }
      td { padding: 8px; border-bottom: 1px solid #ddd; }
      .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; text-align: right; font-size: 16px; }
      .totals .total { font-size: 20px; font-weight: bold; }
      .cae-section { margin-top: 20px; padding: 15px; background: #f0f0f0; border: 1px solid #ccc; text-align: center; }
      .cae-section .cae-number { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
      .comprobante-autorizado { display: inline-block; border: 2px solid #1a1a1a; padding: 5px 20px; font-weight: bold; }
    </style>
    </head><body>
    <div class="invoice">
      <div class="header">
        <div class="header-left"><h1>FACTURA</h1><p>Comprobante Autorizado</p></div>
        <div class="header-right">
          <div><strong>Punto de Venta:</strong> ${data.puntoVenta || '0000'}</div>
          <div><strong>Comp. Nro:</strong> ${data.comprobanteNro || '00000000'}</div>
          <div><strong>Fecha Emisión:</strong> ${data.fechaEmision || ''}</div>
          <div><strong>CUIT:</strong> ${data.cuit || ''}</div>
          <div><strong>Ingresos Brutos:</strong> ${data.ingresosBrutos || ''}</div>
          <div><strong>Inicio Actividades:</strong> ${data.fechaInicio || ''}</div>
        </div>
      </div>
      <div class="info-grid">
        <div><span class="label">Periodo Desde:</span> ${data.periodoDesde || ''}</div>
        <div><span class="label">Hasta:</span> ${data.periodoHasta || ''}</div>
        <div><span class="label">Fecha Vto. Pago:</span> ${data.fechaVtoPago || ''}</div>
      </div>
      <div class="info-grid" style="margin-top:0;">
        <div style="grid-column:1/-1;"><span class="label">CUIT Cliente:</span> ${data.cuitCliente || ''}</div>
        <div style="grid-column:1/-1;"><span class="label">Razón Social:</span> ${data.razonSocial || ''}</div>
        <div><span class="label">Condición IVA:</span> ${data.condicionIVA || ''}</div>
        <div><span class="label">Condición Venta:</span> ${data.condicionVenta || ''}</div>
      </div>
      <table><thead><tr><th>Código</th><th style="text-align:center;">Cant.</th><th style="text-align:center;">U. Medida</th><th style="text-align:right;">Precio</th><th style="text-align:center;">% Bonif.</th><th style="text-align:right;">Imp. Bonif.</th><th style="text-align:right;">Subtotal</th></tr></thead><tbody>${itemsRows}</tbody></table>
      <div class="totals"><div><strong>Subtotal:</strong> $ ${data.subtotal || totalFormateado}</div><div><strong>Otros Tributos:</strong> $ ${data.otrosTributos || '0,00'}</div><div class="total"><strong>Total:</strong> $ ${data.total || totalFormateado}</div></div>
      <div class="cae-section"><div><strong>CAE Nº:</strong> <span class="cae-number">${data.caeNro || ''}</span></div><div><strong>Fecha Vto. CAE:</strong> ${data.fechaVtoCAE || ''}</div></div>
      <div class="footer"><div class="comprobante-autorizado">COMPROBANTE AUTORIZADO</div><div>Pág. ${data.pagina || '1/1'}</div></div>
    </div>
    </body></html>`;
  }

  // ===== EXPORTAR PDF DIRECTO =====
  handleExportDirectPDF() {
    var btn = this.shadowRoot.querySelector('#pdf-direct-btn');
    var originalText = '📄 PDF Directo';
    if (btn) {
      btn.textContent = '⏳ Generando...';
      btn.disabled = true;
    }

    var self = this;
    this.loadJSPDF(function() {
      try {
        var formData = self.getFormData();
        var total = 0;
        for (var i = 0; i < formData.items.length; i++) {
          total += parseFloat(formData.items[i].subtotal.replace(',', '.')) || 0;
        }
        formData.subtotal = total.toFixed(2).replace('.', ',');
        formData.total = total.toFixed(2).replace('.', ',');

        var { jsPDF } = window.jspdf;
        var doc = new jsPDF('p', 'mm', 'a4');
        var x = 20, y = 25, lineH = 5.5;

        doc.setFontSize(22);
        doc.text('FACTURA', x, y);
        doc.setFontSize(10);
        doc.text('Comprobante Autorizado', x, y + 7);

        var rx = 190;
        var ry = 25;
        var datos = [
          'Punto de Venta: ' + (formData.puntoVenta || '0000'),
          'Comp. Nro: ' + (formData.comprobanteNro || '00000000'),
          'Fecha Emisión: ' + (formData.fechaEmision || ''),
          'CUIT: ' + (formData.cuit || ''),
          'Ingresos Brutos: ' + (formData.ingresosBrutos || ''),
          'Inicio Actividades: ' + (formData.fechaInicio || '')
        ];
        doc.setFontSize(9);
        for (var d = 0; d < datos.length; d++) {
          doc.text(datos[d], rx, ry, { align: 'right' });
          ry += lineH;
        }

        y = 45;
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.line(x, y, 190, y);

        y += 6;
        doc.setFontSize(9);
        doc.setFillColor(249, 249, 249);
        doc.rect(x, y - 2, 170, 16, 'F');
        doc.text('Periodo Desde: ' + (formData.periodoDesde || ''), x + 5, y + 4);
        doc.text('Hasta: ' + (formData.periodoHasta || ''), x + 5, y + 10);
        doc.text('Fecha Vto. Pago: ' + (formData.fechaVtoPago || ''), x + 80, y + 4);

        y += 22;
        doc.rect(x, y - 2, 170, 22, 'F');
        doc.text('CUIT: ' + (formData.cuitCliente || ''), x + 5, y + 4);
        doc.text('Razón Social: ' + (formData.razonSocial || ''), x + 5, y + 10);
        doc.text('Condición IVA: ' + (formData.condicionIVA || ''), x + 5, y + 16);
        doc.text('Condición Venta: ' + (formData.condicionVenta || ''), x + 80, y + 16);

        y += 28;
        doc.setFillColor(26, 26, 26);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        var cols = [x, x + 50, x + 65, x + 78, x + 95, x + 112, x + 130, 190];
        doc.rect(x, y - 1, 170, 8, 'F');
        doc.text('Código', cols[0] + 2, y + 5);
        doc.text('Cant.', cols[1] + 2, y + 5);
        doc.text('U.Med', cols[2] + 2, y + 5);
        doc.text('Precio', cols[3] + 2, y + 5);
        doc.text('%Bonif', cols[4] + 2, y + 5);
        doc.text('Imp.Bonif', cols[5] + 2, y + 5);
        doc.text('Subtotal', cols[6] + 2, y + 5);

        y += 10;
        doc.setTextColor(0, 0, 0);
        var maxItems = 12;
        for (var it = 0; it < Math.min(formData.items.length, maxItems); it++) {
          if (y > 270) { doc.addPage(); y = 20; }
          var item = formData.items[it];
          if (it % 2 === 0) {
            doc.setFillColor(248, 248, 248);
            doc.rect(x, y - 1, 170, 6, 'F');
          }
          var cod = (item.codigo || '').substring(0, 25);
          doc.text(cod, cols[0] + 2, y + 4);
          doc.text(item.cantidad || '1,00', cols[1] + 2, y + 4);
          doc.text((item.unidad || 'otras').substring(0, 8), cols[2] + 2, y + 4);
          doc.text('$ ' + (item.precio || '0,00'), cols[3] + 2, y + 4);
          doc.text((item.bonif || '0,00') + '%', cols[4] + 2, y + 4);
          doc.text('$ ' + (item.impBonif || '0,00'), cols[5] + 2, y + 4);
          doc.text('$ ' + (item.subtotal || '0,00'), cols[6] + 2, y + 4, { align: 'right' });
          y += 6;
        }

        y += 6;
        doc.setLineWidth(0.5);
        doc.line(x, y, 190, y);
        y += 6;
        doc.setFontSize(10);
        doc.text('Subtotal: $ ' + (formData.subtotal || '0,00'), 190, y, { align: 'right' });
        y += 6;
        doc.text('Otros Tributos: $ ' + (formData.otrosTributos || '0,00'), 190, y, { align: 'right' });
        y += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Total: $ ' + (formData.total || '0,00'), 190, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        y += 12;
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y - 2, 170, 16, 'F');
        doc.setFontSize(10);
        doc.text('CAE Nº: ' + (formData.caeNro || ''), 105, y + 5, { align: 'center' });
        doc.text('Fecha Vto. CAE: ' + (formData.fechaVtoCAE || ''), 105, y + 12, { align: 'center' });

        y += 22;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('COMPROBANTE AUTORIZADO', 105, y, { align: 'center' });
        doc.text('Pág. ' + (formData.pagina || '1/1'), 105, y + 6, { align: 'center' });

        doc.save('Factura_AFIP_' + (formData.comprobanteNro || '00000000') + '.pdf');

        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      } catch (error) {
        alert('Error: ' + error.message);
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        }
      }
    });
  }

  // ===== SUBMIT =====
  handleSubmit(event) {
    event.preventDefault();
    this.generateInvoice();
  }

  // ===== RENDER =====
  render() {
    this.shadowRoot.textContent = '';
    
    var style = document.createElement('style');
    style.textContent = `
      :host { display: block; font-family: -apple-system, sans-serif; max-width: 1000px; margin: 20px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; overflow: hidden; }
      .form-header { background: linear-gradient(135deg, #1a3a5c, #2d6a9f); color: white; padding: 20px 30px; }
      .form-header h2 { margin: 0; font-size: 22px; }
      .form-header p { margin: 5px 0 0; opacity: 0.85; font-size: 14px; }
      .form-body { padding: 25px 30px; }
      .form-section { margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
      .form-section h3 { margin: 0 0 15px; color: #1a3a5c; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
      .form-field { display: flex; flex-direction: column; }
      .form-field label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
      .form-field input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
      .form-field input:focus { outline: none; border-color: #2d6a9f; }
      .form-field input[readonly] { background: #f1f5f9; color: #475569; }
      .form-field.full-width { grid-column: 1 / -1; }
      .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
      .items-header h4 { margin: 0; color: #1a3a5c; font-size: 14px; }
      .btn-add-item { padding: 6px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
      .btn-add-item:hover { background: #059669; }
      #items-container { margin-bottom: 15px; }
      .item-row { display: grid; grid-template-columns: 2fr 0.7fr 1.2fr 0.8fr 0.7fr 0.8fr 0.8fr 0.3fr; gap: 8px; align-items: end; padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
      .item-field { display: flex; flex-direction: column; }
      .item-field label { font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 2px; }
      .item-field input { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; width: 100%; }
      .item-field.small input { font-size: 12px; padding: 6px 4px; }
      .item-field.remove-btn { display: flex; align-items: flex-end; justify-content: center; }
      .btn-remove { background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 10px; font-size: 16px; cursor: pointer; }
      .btn-remove:hover { background: #dc2626; }
      .form-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; justify-content: flex-end; }
      .btn-generate { padding: 12px 30px; background: linear-gradient(135deg, #1a3a5c, #2d6a9f); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; }
      .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(26,58,92,0.3); }
      .btn-pdf-direct { padding: 12px 30px; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer; }
      .btn-pdf-direct:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239,68,68,0.3); }
      .btn-pdf-direct:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      @media (max-width: 768px) {
        .item-row { grid-template-columns: 1fr 1fr; gap: 6px; }
        .item-field.remove-btn { grid-column: 1 / -1; justify-content: flex-end; }
        .form-grid { grid-template-columns: 1fr; }
        .form-body { padding: 15px; }
        .form-actions { flex-direction: column; }
        .form-actions button { width: 100%; }
      }
    `;
    this.shadowRoot.appendChild(style);
    
    var form = document.createElement('form');
    form.id = 'invoice-form';
    // No asignar evento aquí, se hace en connectedCallback
    
    var header = document.createElement('div');
    header.className = 'form-header';
    var title = document.createElement('h2');
    title.appendChild(document.createTextNode('📄 Generador de Factura AFIP'));
    header.appendChild(title);
    var subtitle = document.createElement('p');
    subtitle.appendChild(document.createTextNode('Complete los datos y haga clic en "Generar Factura"'));
    header.appendChild(subtitle);
    form.appendChild(header);
    
    var body = document.createElement('div');
    body.className = 'form-body';
    
    // SECCIONES
    var secciones = [
      { titulo: '📋 Encabezado', campos: [
        { name: 'puntoVenta', label: 'Punto de Venta', value: this._invoiceData.puntoVenta },
        { name: 'comprobanteNro', label: 'Comp. Nro', value: this._invoiceData.comprobanteNro },
        { name: 'fechaEmision', label: 'Fecha Emisión', value: this._invoiceData.fechaEmision },
        { name: 'cuit', label: 'CUIT', value: this._invoiceData.cuit },
        { name: 'ingresosBrutos', label: 'Ingresos Brutos', value: this._invoiceData.ingresosBrutos },
        { name: 'fechaInicio', label: 'Inicio Actividades', value: this._invoiceData.fechaInicio }
      ]},
      { titulo: '📅 Periodo', campos: [
        { name: 'periodoDesde', label: 'Desde', value: this._invoiceData.periodoDesde },
        { name: 'periodoHasta', label: 'Hasta', value: this._invoiceData.periodoHasta },
        { name: 'fechaVtoPago', label: 'Fecha Vto. Pago', value: this._invoiceData.fechaVtoPago }
      ]},
      { titulo: '👤 Cliente', campos: [
        { name: 'cuitCliente', label: 'CUIT Cliente', value: this._invoiceData.cuitCliente },
        { name: 'razonSocial', label: 'Razón Social', value: this._invoiceData.razonSocial, full: true },
        { name: 'condicionIVA', label: 'Condición IVA', value: this._invoiceData.condicionIVA },
        { name: 'condicionVenta', label: 'Condición Venta', value: this._invoiceData.condicionVenta }
      ]},
      { titulo: '💰 Totales', campos: [
        { name: 'subtotal', label: 'Subtotal', value: this._invoiceData.subtotal },
        { name: 'otrosTributos', label: 'Otros Tributos', value: this._invoiceData.otrosTributos },
        { name: 'total', label: 'Total', value: this._invoiceData.total }
      ]},
      { titulo: '🔐 CAE', campos: [
        { name: 'caeNro', label: 'CAE Nº', value: this._invoiceData.caeNro },
        { name: 'fechaVtoCAE', label: 'Fecha Vto. CAE', value: this._invoiceData.fechaVtoCAE },
        { name: 'pagina', label: 'Página', value: this._invoiceData.pagina }
      ]}
    ];
    
    for (var s = 0; s < secciones.length; s++) {
      var sec = secciones[s];
      var section = document.createElement('div');
      section.className = 'form-section';
      var h3 = document.createElement('h3');
      h3.appendChild(document.createTextNode(sec.titulo));
      section.appendChild(h3);
      var grid = document.createElement('div');
      grid.className = 'form-grid';
      for (var c = 0; c < sec.campos.length; c++) {
        var field = sec.campos[c];
        var f = this.createField(field.name, field.label, field.value, field.full);
        grid.appendChild(f);
      }
      section.appendChild(grid);
      body.appendChild(section);
    }
    
    // SECCIÓN ITEMS
    var sectionItems = document.createElement('div');
    sectionItems.className = 'form-section';
    var h3Items = document.createElement('h3');
    h3Items.appendChild(document.createTextNode('📦 Productos/Servicios'));
    sectionItems.appendChild(h3Items);
    var itemsHeader = document.createElement('div');
    itemsHeader.className = 'items-header';
    var h4 = document.createElement('h4');
    h4.appendChild(document.createTextNode('Items de la factura'));
    itemsHeader.appendChild(h4);
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-add-item';
    addBtn.appendChild(document.createTextNode('➕ Agregar Item'));
    // No asignar evento aquí, se hace en connectedCallback
    itemsHeader.appendChild(addBtn);
    sectionItems.appendChild(itemsHeader);
    var itemsContainer = document.createElement('div');
    itemsContainer.id = 'items-container';
    sectionItems.appendChild(itemsContainer);
    body.appendChild(sectionItems);
    
    // BOTONES
    var actions = document.createElement('div');
    actions.className = 'form-actions';
    var generateBtn = document.createElement('button');
    generateBtn.type = 'submit';
    generateBtn.className = 'btn-generate';
    generateBtn.appendChild(document.createTextNode('📄 Abrir Factura'));
    actions.appendChild(generateBtn);
    var pdfBtn = document.createElement('button');
    pdfBtn.type = 'button';
    pdfBtn.className = 'btn-pdf-direct';
    pdfBtn.id = 'pdf-direct-btn';
    pdfBtn.appendChild(document.createTextNode('📄 PDF Directo'));
    // No asignar evento aquí, se hace en connectedCallback
    actions.appendChild(pdfBtn);
    body.appendChild(actions);
    
    form.appendChild(body);
    this.shadowRoot.appendChild(form);
  }

  createField(name, label, value, fullWidth) {
    var div = document.createElement('div');
    div.className = 'form-field' + (fullWidth ? ' full-width' : '');
    var labelEl = document.createElement('label');
    labelEl.appendChild(document.createTextNode(label));
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