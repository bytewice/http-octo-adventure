const http = require('http');
const fs = require('fs');
const path = require('path');

// Configurações do servidor
const hostname = '127.0.0.1'; // Localhost
const port = 3000;

const server = http.createServer((req, res) => {
  // Configurando o cabeçalho da resposta (Status 200 = OK)
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // Lógica de rotas simples
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'screens', 'index.html'), (err, content) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.url === '/sobre') {
    res.end('Este é um servidor HTTP básico criado com Node.js.');
  } 
    else if(req.url === '/login'){
        res.end('Aqui deveria estar logado p qlq um...')
  }
  else {
    res.statusCode = 404;
    res.end('Página não encontrada.');
  }
});

// Iniciando o servidor
server.listen(port, hostname, () => {
  console.log(`Servidor rodando em http://${hostname}:${port}/`);
});