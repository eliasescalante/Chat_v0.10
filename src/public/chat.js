const socket = io();

// Preguntar el nombre de usuario
let username;
Swal.fire({
  title: 'Ingresa tu nombre de usuario',
  input: 'text',
  inputValidator: (value) => {
    if (!value) {
      return '¡Necesitas ingresar un nombre!';
    }
  },
}).then((result) => {
  username = result.value;
});

const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Enviar mensaje
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  if (message) {
    const data = { username, message };
    socket.emit('sendMessage', data);
    messageInput.value = '';
  }
});

// Recibir mensajes anteriores
socket.on('previousMessages', (messages) => {
  messages.forEach((data) => {
    addMessage(data);
  });
});

// Recibir mensaje
socket.on('receivedMessage', (data) => {
  addMessage(data);
});

function addMessage(data) {
  const div = document.createElement('div');
  div.className = 'message';
  div.innerHTML = `<strong>${data.username}</strong>: ${data.message}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;  // Scroll automático hacia el final
}
