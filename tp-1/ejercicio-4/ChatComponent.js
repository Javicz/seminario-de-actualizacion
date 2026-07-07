class ChatComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuración del chat
    this._config = {
      user: {
        name: 'Tú',
        avatar: 'https://www.w3schools.com/w3images/avatar_g2.jpg'
      },
      other: {
        name: 'Otro',
        avatar: 'https://www.w3schools.com/w3images/bandmember.jpg'
      }
    };
    
    // Almacenar mensajes (para posible historial)
    this._messages = [];
    
    // Bind de métodos
    this.addMessage = this.addMessage.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
    this.getMessages = this.getMessages.bind(this);
  }

  connectedCallback() {
    this.render();
    // Mensajes de ejemplo
    this.addExampleMessages();
  }

  // === MÉTODO PÚBLICO PARA INSERTAR MENSAJES ===
  addMessage(text, isOwn, time) {
    // Validar entrada
    if (!text || typeof text !== 'string') {
      console.error('El mensaje debe ser un texto válido');
      return;
    }
    
    // Si no se proporciona hora, usar la actual
    var timestamp = time || this.getCurrentTime();
    
    // Crear el objeto mensaje
    var message = {
      text: text,
      isOwn: isOwn || false,
      time: timestamp,
      id: Date.now() + Math.random()
    };
    
    // Guardar en el historial
    this._messages.push(message);
    
    // Crear y agregar el elemento DOM
    this.renderMessage(message);
    
    // Scroll al final del chat
    this.scrollToBottom();
    
    return message;
  }

  // === MÉTODOS PÚBLICOS ADICIONALES ===
  clearMessages() {
    this._messages = [];
    var container = this.shadowRoot.querySelector('.chat-container');
    if (container) {
      // Eliminar todos los mensajes excepto el contenedor vacío
      var messages = container.querySelectorAll('.message-wrapper');
      for (var i = messages.length - 1; i >= 0; i--) {
        var parent = messages[i].parentNode;
        if (parent) {
          parent.removeChild(messages[i]);
        }
      }
    }
  }

  getMessages() {
    return JSON.parse(JSON.stringify(this._messages));
  }

  // === MÉTODOS AUXILIARES ===
  getCurrentTime() {
    var now = new Date();
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  scrollToBottom() {
    var container = this.shadowRoot.querySelector('.chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // === MENSAJES DE EJEMPLO ===
  addExampleMessages() {
    var examples = [
      { text: 'Hello. How are you today?', isOwn: false, time: '11:00' },
      { text: "Hey! I'm fine. Thanks for asking!", isOwn: true, time: '11:01' },
      { text: 'Sweet! So, what do you wanna do today?', isOwn: false, time: '11:02' },
      { text: 'Nah, I dunno. Play soccer.. or learn more coding perhaps?', isOwn: true, time: '11:05' }
    ];
    
    // Usar setTimeout para que se rendericen con animación
    var self = this;
    examples.forEach(function(msg, index) {
      setTimeout(function() {
        self.addMessage(msg.text, msg.isOwn, msg.time);
      }, index * 300);
    });
  }

  // === RENDERIZADO DE MENSAJE INDIVIDUAL ===
  renderMessage(message) {
    var container = this.shadowRoot.querySelector('.chat-container');
    if (!container) return;

    // Crear wrapper del mensaje
    var wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';
    
    // Crear contenedor del mensaje
    var messageDiv = document.createElement('div');
    messageDiv.className = 'container' + (message.isOwn ? ' darker' : '');
    
    // Crear imagen (avatar)
    var img = document.createElement('img');
    img.src = message.isOwn ? this._config.user.avatar : this._config.other.avatar;
    img.alt = message.isOwn ? this._config.user.name : this._config.other.name;
    if (message.isOwn) {
      img.className = 'right';
    }
    
    // Crear párrafo con el texto
    var paragraph = document.createElement('p');
    var textNode = document.createTextNode(message.text);
    paragraph.appendChild(textNode);
    
    // Crear span con la hora
    var timeSpan = document.createElement('span');
    timeSpan.className = message.isOwn ? 'time-left' : 'time-right';
    var timeNode = document.createTextNode(message.time);
    timeSpan.appendChild(timeNode);
    
    // Ensamblar el mensaje
    messageDiv.appendChild(img);
    messageDiv.appendChild(paragraph);
    messageDiv.appendChild(timeSpan);
    
    wrapper.appendChild(messageDiv);
    container.appendChild(wrapper);
  }

  // === RENDERIZADO PRINCIPAL ===
  render() {
    this.shadowRoot.textContent = '';

    // Estilos
    var style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        max-width: 800px;
        margin: 20px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }
      
      .chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-bottom: 2px solid #5a67d8;
      }
      
      .chat-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .chat-header .subtitle {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 4px;
      }
      
      .chat-container {
        padding: 20px;
        height: 450px;
        overflow-y: auto;
        background-color: #f8fafc;
      }
      
      .message-wrapper {
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .container {
        border: 2px solid #dedede;
        background-color: #f1f1f1;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 8px 0;
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .darker {
        border-color: #ccc;
        background-color: #e8e8e8;
      }
      
      .container::after {
        content: "";
        clear: both;
        display: table;
      }
      
      .container img {
        float: left;
        max-width: 45px;
        width: 100%;
        margin-right: 15px;
        border-radius: 50%;
        border: 2px solid #white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .container img.right {
        float: right;
        margin-left: 15px;
        margin-right: 0;
      }
      
      .container p {
        margin: 0;
        padding: 6px 0;
        font-size: 15px;
        line-height: 1.5;
        color: #1e293b;
      }
      
      .time-right {
        float: right;
        color: #94a3b8;
        font-size: 12px;
        margin-top: 4px;
      }
      
      .time-left {
        float: left;
        color: #94a3b8;
        font-size: 12px;
        margin-top: 4px;
      }
      
      /* Scroll personalizado */
      .chat-container::-webkit-scrollbar {
        width: 6px;
      }
      
      .chat-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .chat-container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
      
      .chat-container::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      .chat-footer {
        padding: 16px 24px;
        background: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 10px;
      }
      
      .chat-footer input {
        flex: 1;
        padding: 10px 14px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .chat-footer input:focus {
        border-color: #667eea;
      }
      
      .chat-footer button {
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .chat-footer button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      .chat-footer button:active {
        transform: translateY(0);
      }
      
      .chat-footer .btn-clear {
        background: #ef4444;
      }
      
      .chat-footer .btn-clear:hover {
        background: #dc2626;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      }
      
      /* Estilos para el estado vacío */
      .empty-state {
        text-align: center;
        color: #94a3b8;
        padding: 60px 20px;
        font-size: 16px;
      }
      
      .empty-state .icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
    `;
    this.shadowRoot.appendChild(style);

    // Header
    var header = document.createElement('div');
    header.className = 'chat-header';
    
    var title = document.createElement('h2');
    var titleText = document.createTextNode('💬 Chat');
    title.appendChild(titleText);
    header.appendChild(title);
    
    var subtitle = document.createElement('div');
    subtitle.className = 'subtitle';
    var subtitleText = document.createTextNode('Conectado como: ' + this._config.user.name);
    subtitle.appendChild(subtitleText);
    header.appendChild(subtitle);
    
    this.shadowRoot.appendChild(header);

    // Contenedor de mensajes
    var chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // Estado vacío (visible inicialmente)
    var emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.id = 'empty-state';
    
    var iconSpan = document.createElement('div');
    iconSpan.className = 'icon';
    var iconText = document.createTextNode('💭');
    iconSpan.appendChild(iconText);
    emptyState.appendChild(iconSpan);
    
    var emptyText = document.createElement('p');
    var emptyTextNode = document.createTextNode('No hay mensajes aún. ¡Comienza la conversación!');
    emptyText.appendChild(emptyTextNode);
    emptyState.appendChild(emptyText);
    
    chatContainer.appendChild(emptyState);
    this.shadowRoot.appendChild(chatContainer);

    // Footer con input y botones
    var footer = document.createElement('div');
    footer.className = 'chat-footer';
    
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Escribe un mensaje...';
    input.id = 'message-input';
    footer.appendChild(input);
    
    var sendBtn = document.createElement('button');
    var sendText = document.createTextNode('Enviar');
    sendBtn.appendChild(sendText);
    sendBtn.id = 'send-btn';
    footer.appendChild(sendBtn);
    
    var clearBtn = document.createElement('button');
    clearBtn.className = 'btn-clear';
    var clearText = document.createTextNode('Limpiar');
    clearBtn.appendChild(clearText);
    clearBtn.id = 'clear-btn';
    footer.appendChild(clearBtn);
    
    this.shadowRoot.appendChild(footer);

    // Event listeners (sin arrow functions)
    sendBtn.addEventListener('click', function() {
      var inputField = this.shadowRoot.querySelector('#message-input');
      var text = inputField.value.trim();
      if (text) {
        this.addMessage(text, true);
        inputField.value = '';
        inputField.focus();
      }
    }.bind(this));

    input.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        var inputField = this.shadowRoot.querySelector('#message-input');
        var text = inputField.value.trim();
        if (text) {
          this.addMessage(text, true);
          inputField.value = '';
        }
      }
    }.bind(this));

    clearBtn.addEventListener('click', function() {
      this.clearMessages();
    }.bind(this));

    // Ocultar estado vacío cuando haya mensajes
    this._hideEmptyState = function() {
      var emptyStateElement = this.shadowRoot.querySelector('#empty-state');
      if (emptyStateElement) {
        emptyStateElement.style.display = 'none';
      }
    }.bind(this);
    
    this._showEmptyState = function() {
      var emptyStateElement = this.shadowRoot.querySelector('#empty-state');
      if (emptyStateElement) {
        emptyStateElement.style.display = 'block';
      }
    }.bind(this);

    // Sobrescribir addMessage para manejar el estado vacío
    var originalAddMessage = this.addMessage;
    this.addMessage = function(text, isOwn, time) {
      // Ocultar estado vacío
      this._hideEmptyState();
      // Llamar al método original
      return originalAddMessage.call(this, text, isOwn, time);
    }.bind(this);

    // Sobrescribir clearMessages para manejar el estado vacío
    var originalClearMessages = this.clearMessages;
    this.clearMessages = function() {
      originalClearMessages.call(this);
      this._showEmptyState();
    }.bind(this);
  }
}

// Registrar el componente
customElements.define('chat-component', ChatComponent);