const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar Handlebars
const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts'),
});

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'src/public')));

// Ruta principal
app.get('/', (req, res) => {
  res.render('chat');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  // Enviar mensajes anteriores
  fs.readFile('src/utils/messages.json', (err, data) => {
    if (!err) {
      const messages = JSON.parse(data);
      socket.emit('previousMessages', messages);
    }
  });

  socket.on('sendMessage', (data) => {
    // Leer mensajes anteriores
    fs.readFile('src/utils/messages.json', (err, fileData) => {
      const messages = err ? [] : JSON.parse(fileData);
      messages.push(data);

      // Guardar nuevo mensaje
      fs.writeFile('src/utils/messages.json', JSON.stringify(messages), (err) => {
        if (err) throw err;
        io.emit('receivedMessage', data);
      });
    });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
